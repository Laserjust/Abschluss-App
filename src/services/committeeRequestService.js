// Service für die Verwaltung von Komitee-Beitrittsanfragen
class CommitteeRequestService {
  constructor() {
    this.requests = JSON.parse(localStorage.getItem('committeeRequests') || '[]');
    this.listeners = [];
  }

  // Event Listener für Änderungen
  addListener(callback) {
    this.listeners.push(callback);
  }

  removeListener(callback) {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  }

  notifyListeners() {
    this.listeners.forEach(callback => callback(this.requests));
  }

  // Speichert Anfragen im localStorage
  saveRequests() {
    localStorage.setItem('committeeRequests', JSON.stringify(this.requests));
    this.notifyListeners();
  }

  // Erstellt eine neue Beitrittsanfrage
  createJoinRequest(userId, userName, userEmail, committeeId, committeeName, message = '') {
    const request = {
      id: Date.now().toString(),
      userId,
      userName,
      userEmail,
      committeeId,
      committeeName,
      message,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.requests.push(request);
    this.saveRequests();
    return request;
  }

  // Genehmigt eine Beitrittsanfrage
  approveRequest(requestId, approvedBy) {
    const request = this.requests.find(r => r.id === requestId);
    if (request) {
      request.status = 'approved';
      request.approvedBy = approvedBy;
      request.approvedAt = new Date().toISOString();
      request.updatedAt = new Date().toISOString();
      this.saveRequests();
      return request;
    }
    return null;
  }

  // Lehnt eine Beitrittsanfrage ab
  rejectRequest(requestId, rejectedBy, reason = '') {
    const request = this.requests.find(r => r.id === requestId);
    if (request) {
      request.status = 'rejected';
      request.rejectedBy = rejectedBy;
      request.rejectionReason = reason;
      request.rejectedAt = new Date().toISOString();
      request.updatedAt = new Date().toISOString();
      this.saveRequests();
      return request;
    }
    return null;
  }

  // Holt alle Anfragen
  getAllRequests() {
    return this.requests;
  }

  // Holt ausstehende Anfragen
  getPendingRequests() {
    return this.requests.filter(request => request.status === 'pending');
  }

  // Holt Anfragen für ein bestimmtes Komitee
  getRequestsForCommittee(committeeId) {
    return this.requests.filter(request => request.committeeId === committeeId);
  }

  // Holt ausstehende Anfragen für ein bestimmtes Komitee
  getPendingRequestsForCommittee(committeeId) {
    return this.requests.filter(request => 
      request.committeeId === committeeId && request.status === 'pending'
    );
  }

  // Holt Anfragen eines bestimmten Benutzers
  getRequestsForUser(userId) {
    return this.requests.filter(request => request.userId === userId);
  }

  // Prüft, ob ein Benutzer bereits eine ausstehende Anfrage für ein Komitee hat
  hasPendingRequest(userId, committeeId) {
    return this.requests.some(request => 
      request.userId === userId && 
      request.committeeId === committeeId && 
      request.status === 'pending'
    );
  }

  // Löscht eine Anfrage
  deleteRequest(requestId) {
    this.requests = this.requests.filter(request => request.id !== requestId);
    this.saveRequests();
  }

  // Löscht alle Anfragen für ein Komitee
  deleteRequestsForCommittee(committeeId) {
    this.requests = this.requests.filter(request => request.committeeId !== committeeId);
    this.saveRequests();
  }

  // Statistiken
  getRequestStats() {
    const total = this.requests.length;
    const pending = this.requests.filter(r => r.status === 'pending').length;
    const approved = this.requests.filter(r => r.status === 'approved').length;
    const rejected = this.requests.filter(r => r.status === 'rejected').length;

    return {
      total,
      pending,
      approved,
      rejected
    };
  }
}

// Singleton-Instanz
const committeeRequestService = new CommitteeRequestService();
export default committeeRequestService;