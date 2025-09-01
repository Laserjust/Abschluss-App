/**
 * Chat Service
 * 
 * Dieser Service verwaltet alle Chat-bezogenen Operationen.
 * Unterstützt sowohl Demo-Modus als auch Produktionsmodus.
 */

// Demo-Modus Konfiguration
const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true';

// Mock-Daten für Demo-Modus
let mockConversations = [];
let mockMessages = [];
let mockParticipants = [];

// Lokale Speicher-Schlüssel
const STORAGE_KEYS = {
  conversations: 'chat_conversations',
  messages: 'chat_messages',
  participants: 'chat_participants'
};

// Hilfsfunktionen für Demo-Modus
function loadFromStorage(key) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.warn(`Fehler beim Laden von ${key}:`, error);
    return [];
  }
}

function saveToStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.warn(`Fehler beim Speichern von ${key}:`, error);
  }
}

function generateId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Initialisierung für Demo-Modus
if (DEMO_MODE) {
  mockConversations = loadFromStorage(STORAGE_KEYS.conversations);
  mockMessages = loadFromStorage(STORAGE_KEYS.messages);
  mockParticipants = loadFromStorage(STORAGE_KEYS.participants);
}

/**
 * Konversationen abrufen
 * @param {string} userId - ID des aktuellen Benutzers
 * @returns {Promise<Array>} Liste der Konversationen
 */
export async function getConversations(userId) {
  if (DEMO_MODE) {
    console.log('📱 [Demo] Lade Konversationen für Benutzer:', userId);
    
    // Filtere Konversationen basierend auf Teilnahme
    const userParticipations = mockParticipants.filter(p => p.user_id === userId);
    const conversationIds = userParticipations.map(p => p.conversation_id);
    
    const userConversations = mockConversations
      .filter(conv => conversationIds.includes(conv.id))
      .map(conv => {
        // Füge Teilnehmer-Info hinzu
        const participation = userParticipations.find(p => p.conversation_id === conv.id);
        return {
          ...conv,
          user_role: participation?.role || 'participant',
          joined_at: participation?.joined_at
        };
      })
      .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
    
    return { data: userConversations, error: null };
  }
  
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        conversation_participants!inner(
          role,
          joined_at
        )
      `)
      .eq('conversation_participants.user_id', userId)
      .eq('is_active', true)
      .order('updated_at', { ascending: false });
    
    if (error) throw error;
    
    // Transformiere Daten für einheitliche Struktur
    const conversations = data.map(conv => ({
      ...conv,
      user_role: conv.conversation_participants[0]?.role || 'participant',
      joined_at: conv.conversation_participants[0]?.joined_at
    }));
    
    return { data: conversations, error: null };
  } catch (error) {
    console.error('Fehler beim Abrufen der Konversationen:', error);
    return { data: [], error };
  }
}

/**
 * Nachrichten einer Konversation abrufen
 * @param {string} conversationId - ID der Konversation
 * @param {number} limit - Anzahl der Nachrichten (Standard: 50)
 * @param {string} before - Nachrichten vor diesem Zeitstempel abrufen
 * @returns {Promise<Array>} Liste der Nachrichten
 */
export async function getMessages(conversationId, limit = 50, before = null) {
  if (DEMO_MODE) {
    console.log('📱 [Demo] Lade Nachrichten für Konversation:', conversationId);
    
    let messages = mockMessages
      .filter(msg => msg.conversation_id === conversationId && !msg.is_deleted)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    if (before) {
      messages = messages.filter(msg => new Date(msg.created_at) < new Date(before));
    }
    
    messages = messages.slice(0, limit);
    
    return { data: messages, error: null };
  }
  
  try {
    let query = supabase
      .from('messages')
      .select(`
        *,
        sender:users(id, name, email)
      `)
      .eq('conversation_id', conversationId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (before) {
      query = query.lt('created_at', before);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Fehler beim Abrufen der Nachrichten:', error);
    return { data: [], error };
  }
}

/**
 * Neue Nachricht senden
 * @param {string} conversationId - ID der Konversation
 * @param {string} senderId - ID des Absenders
 * @param {string} content - Nachrichteninhalt
 * @param {string} messageType - Typ der Nachricht (text, image, file)
 * @param {Object} metadata - Zusätzliche Metadaten
 * @returns {Promise<Object>} Gesendete Nachricht
 */
export async function sendMessage(conversationId, senderId, content, messageType = 'text', metadata = {}) {
  const now = new Date().toISOString();
  
  const messageData = {
    id: generateId(),
    conversation_id: conversationId,
    sender_id: senderId,
    content,
    message_type: messageType,
    is_edited: false,
    is_deleted: false,
    created_at: now,
    updated_at: now,
    metadata
  };
  
  if (DEMO_MODE) {
    console.log('📱 [Demo] Sende Nachricht:', messageData);
    
    // Füge Nachricht zu Mock-Daten hinzu
    mockMessages.push(messageData);
    saveToStorage(STORAGE_KEYS.messages, mockMessages);
    
    // Aktualisiere Konversations-Zeitstempel
    const conversationIndex = mockConversations.findIndex(conv => conv.id === conversationId);
    if (conversationIndex !== -1) {
      mockConversations[conversationIndex].updated_at = now;
      saveToStorage(STORAGE_KEYS.conversations, mockConversations);
    }
    
    return { data: messageData, error: null };
  }
  
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert([messageData])
      .select(`
        *,
        sender:users(id, name, email)
      `)
      .single();
    
    if (error) throw error;
    
    // Aktualisiere Konversations-Zeitstempel
    await supabase
      .from('conversations')
      .update({ updated_at: now })
      .eq('id', conversationId);
    
    return { data, error: null };
  } catch (error) {
    console.error('Fehler beim Senden der Nachricht:', error);
    return { data: null, error };
  }
}

/**
 * Neue Konversation erstellen
 * @param {string} title - Titel der Konversation
 * @param {string} type - Typ (group, direct)
 * @param {string} createdBy - ID des Erstellers
 * @param {Array} participants - Liste der Teilnehmer-IDs
 * @param {Object} metadata - Zusätzliche Metadaten
 * @returns {Promise<Object>} Erstellte Konversation
 */
export async function createConversation(title, type, createdBy, participants = [], metadata = {}) {
  const now = new Date().toISOString();
  
  const conversationData = {
    id: generateId(),
    title,
    type,
    is_active: true,
    created_by: createdBy,
    created_at: now,
    updated_at: now,
    metadata
  };
  
  if (DEMO_MODE) {
    console.log('📱 [Demo] Erstelle Konversation:', conversationData);
    
    // Füge Konversation hinzu
    mockConversations.push(conversationData);
    saveToStorage(STORAGE_KEYS.conversations, mockConversations);
    
    // Füge Teilnehmer hinzu
    const participantData = participants.map(userId => ({
      id: generateId(),
      conversation_id: conversationData.id,
      user_id: userId,
      role: userId === createdBy ? 'admin' : 'participant',
      joined_at: now
    }));
    
    mockParticipants.push(...participantData);
    saveToStorage(STORAGE_KEYS.participants, mockParticipants);
    
    return { data: conversationData, error: null };
  }
  
  try {
    // Erstelle Konversation
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .insert([conversationData])
      .select()
      .single();
    
    if (convError) throw convError;
    
    // Füge Teilnehmer hinzu
    if (participants.length > 0) {
      const participantData = participants.map(userId => ({
        id: generateId(),
        conversation_id: conversation.id,
        user_id: userId,
        role: userId === createdBy ? 'admin' : 'participant',
        joined_at: now
      }));
      
      const { error: participantError } = await supabase
        .from('conversation_participants')
        .insert(participantData);
      
      if (participantError) {
        console.warn('Fehler beim Hinzufügen von Teilnehmern:', participantError);
      }
    }
    
    return { data: conversation, error: null };
  } catch (error) {
    console.error('Fehler beim Erstellen der Konversation:', error);
    return { data: null, error };
  }
}

/**
 * Teilnehmer zu Konversation hinzufügen
 * @param {string} conversationId - ID der Konversation
 * @param {string} userId - ID des Benutzers
 * @param {string} role - Rolle des Teilnehmers
 * @returns {Promise<Object>} Ergebnis der Operation
 */
export async function addParticipant(conversationId, userId, role = 'participant') {
  const now = new Date().toISOString();
  
  const participantData = {
    id: generateId(),
    conversation_id: conversationId,
    user_id: userId,
    role,
    joined_at: now
  };
  
  if (DEMO_MODE) {
    console.log('📱 [Demo] Füge Teilnehmer hinzu:', participantData);
    
    // Prüfe, ob Teilnehmer bereits existiert
    const existingIndex = mockParticipants.findIndex(
      p => p.conversation_id === conversationId && p.user_id === userId
    );
    
    if (existingIndex !== -1) {
      return { data: null, error: { message: 'Benutzer ist bereits Teilnehmer' } };
    }
    
    mockParticipants.push(participantData);
    saveToStorage(STORAGE_KEYS.participants, mockParticipants);
    
    return { data: participantData, error: null };
  }
  
  try {
    const { data, error } = await supabase
      .from('conversation_participants')
      .insert([participantData])
      .select()
      .single();
    
    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Fehler beim Hinzufügen des Teilnehmers:', error);
    return { data: null, error };
  }
}

/**
 * Teilnehmer aus Konversation entfernen
 * @param {string} conversationId - ID der Konversation
 * @param {string} userId - ID des Benutzers
 * @returns {Promise<Object>} Ergebnis der Operation
 */
export async function removeParticipant(conversationId, userId) {
  if (DEMO_MODE) {
    console.log('📱 [Demo] Entferne Teilnehmer:', { conversationId, userId });
    
    const index = mockParticipants.findIndex(
      p => p.conversation_id === conversationId && p.user_id === userId
    );
    
    if (index === -1) {
      return { data: null, error: { message: 'Teilnehmer nicht gefunden' } };
    }
    
    mockParticipants.splice(index, 1);
    saveToStorage(STORAGE_KEYS.participants, mockParticipants);
    
    return { data: { success: true }, error: null };
  }
  
  try {
    const { error } = await supabase
      .from('conversation_participants')
      .delete()
      .eq('conversation_id', conversationId)
      .eq('user_id', userId);
    
    if (error) throw error;
    
    return { data: { success: true }, error: null };
  } catch (error) {
    console.error('Fehler beim Entfernen des Teilnehmers:', error);
    return { data: null, error };
  }
}

/**
 * Nachricht bearbeiten
 * @param {string} messageId - ID der Nachricht
 * @param {string} newContent - Neuer Inhalt
 * @returns {Promise<Object>} Bearbeitete Nachricht
 */
export async function editMessage(messageId, newContent) {
  const now = new Date().toISOString();
  
  if (DEMO_MODE) {
    console.log('📱 [Demo] Bearbeite Nachricht:', { messageId, newContent });
    
    const messageIndex = mockMessages.findIndex(msg => msg.id === messageId);
    if (messageIndex === -1) {
      return { data: null, error: { message: 'Nachricht nicht gefunden' } };
    }
    
    mockMessages[messageIndex] = {
      ...mockMessages[messageIndex],
      content: newContent,
      is_edited: true,
      updated_at: now
    };
    
    saveToStorage(STORAGE_KEYS.messages, mockMessages);
    
    return { data: mockMessages[messageIndex], error: null };
  }
  
  try {
    const { data, error } = await supabase
      .from('messages')
      .update({
        content: newContent,
        is_edited: true,
        updated_at: now
      })
      .eq('id', messageId)
      .select(`
        *,
        sender:users(id, name, email)
      `)
      .single();
    
    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Fehler beim Bearbeiten der Nachricht:', error);
    return { data: null, error };
  }
}

/**
 * Nachricht löschen
 * @param {string} messageId - ID der Nachricht
 * @returns {Promise<Object>} Ergebnis der Operation
 */
export async function deleteMessage(messageId) {
  const now = new Date().toISOString();
  
  if (DEMO_MODE) {
    console.log('📱 [Demo] Lösche Nachricht:', messageId);
    
    const messageIndex = mockMessages.findIndex(msg => msg.id === messageId);
    if (messageIndex === -1) {
      return { data: null, error: { message: 'Nachricht nicht gefunden' } };
    }
    
    mockMessages[messageIndex] = {
      ...mockMessages[messageIndex],
      is_deleted: true,
      updated_at: now
    };
    
    saveToStorage(STORAGE_KEYS.messages, mockMessages);
    
    return { data: { success: true }, error: null };
  }
  
  try {
    const { error } = await supabase
      .from('messages')
      .update({
        is_deleted: true,
        updated_at: now
      })
      .eq('id', messageId);
    
    if (error) throw error;
    
    return { data: { success: true }, error: null };
  } catch (error) {
    console.error('Fehler beim Löschen der Nachricht:', error);
    return { data: null, error };
  }
}

/**
 * Echtzeit-Abonnement für neue Nachrichten
 * @param {string} conversationId - ID der Konversation
 * @param {Function} callback - Callback-Funktion für neue Nachrichten
 * @returns {Object} Abonnement-Objekt
 */
export function subscribeToMessages(conversationId, callback) {
  if (DEMO_MODE) {
    console.log('📱 [Demo] Abonniere Nachrichten für Konversation:', conversationId);
    
    // Simuliere Echtzeit-Updates mit einem Intervall
    const interval = setInterval(() => {
      // In einer echten Implementierung würden hier neue Nachrichten abgerufen
      // Für Demo-Zwecke machen wir nichts
    }, 5000);
    
    return {
      unsubscribe: () => {
        clearInterval(interval);
        console.log('📱 [Demo] Abonnement beendet für Konversation:', conversationId);
      }
    };
  }
  
  const subscription = supabase
    .channel(`messages:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`
      },
      async (payload) => {
        console.log('📱 Neue Nachricht empfangen:', payload.new);
        
        // Lade vollständige Nachrichtendaten mit Absender-Info
        const { data, error } = await supabase
          .from('messages')
          .select(`
            *,
            sender:users(id, name, email)
          `)
          .eq('id', payload.new.id)
          .single();
        
        if (!error && data) {
          callback(data);
        }
      }
    )
    .subscribe();
  
  return {
    unsubscribe: () => {
      supabase.removeChannel(subscription);
      console.log('📱 Abonnement beendet für Konversation:', conversationId);
    }
  };
}

/**
 * Debug-Funktion: Zeige alle Chat-Daten
 */
export function debugChatData() {
  if (DEMO_MODE) {
    console.log('🐛 [Demo] Chat Debug-Daten:');
    console.log('Konversationen:', mockConversations);
    console.log('Nachrichten:', mockMessages);
    console.log('Teilnehmer:', mockParticipants);
  } else {
    console.log('🐛 Debug-Daten sind nur im Demo-Modus verfügbar');
  }
}

// Exportiere alle Funktionen
export default {
  getConversations,
  getMessages,
  sendMessage,
  createConversation,
  addParticipant,
  removeParticipant,
  editMessage,
  deleteMessage,
  subscribeToMessages,
  debugChatData
};