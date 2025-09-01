import { isDemoMode, getFirestore as getMockFirestore, collection as mockCollection, query as mockQuery, orderBy as mockOrderBy, getDocs as mockGetDocs } from './mockFirestore';
import { getFirestore as getFirebaseFirestore, collection as firebaseCollection, query as firebaseQuery, orderBy as firebaseOrderBy, getDocs as firebaseGetDocs } from 'firebase/firestore';
import dataIsolationService from './dataIsolationService';

/**
 * Service für Finanz-Daten
 * Stellt eine einheitliche Schnittstelle für Finanz-Daten bereit
 * Unterstützt Echtzeit-Updates über Event-System
 */
export class FinanceService {
  constructor() {
    this.listeners = new Set();
    this.lastData = null;
    this.currentYear = null;
  }

  /**
   * Registriert einen Listener für Finanz-Updates
   */
  addListener(callback) {
    this.listeners.add(callback);
    // Sende aktuelle Daten sofort, falls verfügbar
    if (this.lastData) {
      callback(this.lastData);
    }
    return () => this.listeners.delete(callback);
  }

  /**
   * Benachrichtigt alle Listener über Updates
   */
  notifyListeners(data) {
    this.lastData = data;
    this.listeners.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('Error in finance listener:', error);
      }
    });
  }
  initializeFirestore() {
    this.db = isDemoMode() ? getMockFirestore() : getFirebaseFirestore();
    this.collection = isDemoMode() ? mockCollection : firebaseCollection;
    this.query = isDemoMode() ? mockQuery : firebaseQuery;
    this.orderBy = isDemoMode() ? mockOrderBy : firebaseOrderBy;
    this.getDocs = isDemoMode() ? mockGetDocs : firebaseGetDocs;
  }

  /**
   * Setzt das aktuelle Jahr für die Datenisolation
   */
  setCurrentYear(year) {
    this.currentYear = year;
  }

  /**
   * Gibt den jahrgangsspezifischen Transaktions-Collection-Pfad zurück
   */
  getTransactionsCollectionPath() {
    if (!this.currentYear) {
      console.warn('No current year set for FinanceService, using default transactions collection');
      return 'transactions';
    }
    return dataIsolationService.getFinanceTransactionsCollection(this.currentYear);
  }

  /**
   * Lädt alle Transaktionen für den aktuellen Jahrgang
   */
  async getTransactions() {
    try {
      if (!this.db) this.initializeFirestore();
      
      const collectionPath = this.getTransactionsCollectionPath();
      const transactionsQuery = this.query(
        this.collection(this.db, collectionPath),
        this.orderBy('date', 'desc')
      );
      const snapshot = await this.getDocs(transactionsQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate ? doc.data().date.toDate() : new Date(doc.data().date)
      }));
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return [];
    }
  }

  /**
   * Berechnet Finanz-Totals
   */
  calculateTotals(transactions) {
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    return {
      totalIncome: income,
      totalExpenses: expenses,
      currentBalance: income - expenses
    };
  }

  /**
   * Holt die letzten Transaktionen für das Dashboard
   */
  getRecentTransactions(transactions, limit = 3) {
    const recentIncome = transactions
      .filter(t => t.type === 'income')
      .slice(0, limit)
      .map(t => ({
        description: t.description,
        amount: t.amount
      }));

    const recentExpenses = transactions
      .filter(t => t.type === 'expense')
      .slice(0, limit)
      .map(t => ({
        description: t.description,
        amount: -t.amount // Negative für Ausgaben
      }));

    return { recentIncome, recentExpenses };
  }

  /**
   * Berechnet wöchentliche Änderung
   */
  calculateWeeklyChange(transactions) {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const thisWeekTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate >= oneWeekAgo && transactionDate <= now;
    });

    const lastWeekTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate >= twoWeeksAgo && transactionDate < oneWeekAgo;
    });

    const thisWeekBalance = this.calculateTotals(thisWeekTransactions).currentBalance;
    const lastWeekBalance = this.calculateTotals(lastWeekTransactions).currentBalance;

    return {
      weeklyChange: thisWeekBalance - lastWeekBalance,
      weeklyChangePercent: lastWeekBalance !== 0 ? ((thisWeekBalance - lastWeekBalance) / Math.abs(lastWeekBalance)) * 100 : 0
    };
  }

  /**
   * Holt alle Finanz-Daten für das Dashboard
   */
  async getDashboardFinanceData() {
    try {
      const transactions = await this.getTransactions();
      const totals = this.calculateTotals(transactions);
      const recentTransactions = this.getRecentTransactions(transactions);
      const weeklyChange = this.calculateWeeklyChange(transactions);

      const data = {
        currentBalance: totals.currentBalance,
        totalIncome: totals.totalIncome,
        totalExpenses: totals.totalExpenses,
        weeklyChange: weeklyChange.weeklyChange,
        weeklyChangePercent: weeklyChange.weeklyChangePercent,
        recentIncome: recentTransactions.recentIncome,
        recentExpenses: recentTransactions.recentExpenses
      };

      // Benachrichtige alle Listener über die neuen Daten
      this.notifyListeners(data);
      
      return data;
    } catch (error) {
      console.error('Error getting dashboard finance data:', error);
      return null;
    }
  }

  /**
   * Aktualisiert die Finanz-Daten und benachrichtigt Listener
   */
  async refreshData() {
    return await this.getDashboardFinanceData();
  }
}

// Singleton-Instanz
export const financeService = new FinanceService();

// Convenience-Funktionen
export const getDashboardFinanceData = () => financeService.getDashboardFinanceData();
export const getTransactions = () => financeService.getTransactions();
export const calculateTotals = (transactions) => financeService.calculateTotals(transactions);