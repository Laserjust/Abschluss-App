import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { RoleSwitcher } from '../components/RoleSwitcher';
import imageService from '../services/imageService';
import '../styles/profile.css';

// Check if we're in demo mode
const isDemoMode = () => {
  return import.meta.env.VITE_DEMO_MODE === 'true' || import.meta.env.VITE_DEMO_MODE === true;
};

// Profile Image Component
function ProfileImageSection({ user, onImageUpdate }) {
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [profileImage, setProfileImage] = useState(null);

  useEffect(() => {
    // Load existing profile image
    const loadProfileImage = async () => {
      try {
        const imageUrl = await imageService.getProfileImage(user.uid);
        setProfileImage(imageUrl);
      } catch (error) {
        console.error('Fehler beim Laden des Profilbildes:', error);
      }
    };
    
    if (user?.uid) {
      loadProfileImage();
    }
  }, [user]);

  const handleImageSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file
    const validationErrors = imageService.validateImageFile(file);
    if (validationErrors.length > 0) {
      alert(validationErrors.join('\n'));
      return;
    }

    try {
      // Create preview
      const preview = await imageService.createImagePreview(file);
      setImagePreview(preview);
    } catch (error) {
      alert('Fehler beim Erstellen der Vorschau: ' + error.message);
    }
  };

  const handleImageUpload = async () => {
    const fileInput = document.querySelector('input[type="file"]');
    const file = fileInput?.files[0];
    
    if (!file) return;

    setUploading(true);
    try {
      const imageUrl = await imageService.uploadProfileImage(file, user.uid);
      setProfileImage(imageUrl);
      setImagePreview(null);
      if (onImageUpdate) {
        onImageUpdate(imageUrl);
      }
      alert('Profilbild erfolgreich hochgeladen!');
    } catch (error) {
      alert('Fehler beim Hochladen: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleImageCancel = () => {
    setImagePreview(null);
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) fileInput.value = '';
  };

  const getDisplayImage = () => {
    if (imagePreview) return imagePreview;
    if (profileImage) return profileImage;
    return null;
  };

  const getInitials = () => {
    return imageService.generateInitials(user.name || user.email);
  };

  return (
    <div className="profile-image-section">
      <div className="profile-image-container">
        <div className="profile-image">
          {getDisplayImage() ? (
            <img src={getDisplayImage()} alt="Profilbild" />
          ) : (
            <div className="profile-initials">
              {getInitials()}
            </div>
          )}
        </div>
        
        {imagePreview && (
          <div className="image-preview-overlay">
            <div className="preview-actions">
              <button 
                className="btn-upload" 
                onClick={handleImageUpload}
                disabled={uploading}
              >
                {uploading ? 'Hochladen...' : 'Übernehmen'}
              </button>
              <button 
                className="btn-cancel" 
                onClick={handleImageCancel}
                disabled={uploading}
              >
                Abbrechen
              </button>
            </div>
          </div>
        )}
      </div>
      
      <div className="image-upload-section">
        <input 
          type="file" 
          id="profile-image-input"
          accept="image/*"
          onChange={handleImageSelect}
          style={{ display: 'none' }}
        />
        <button 
          className="btn-change-image"
          onClick={() => document.getElementById('profile-image-input').click()}
          disabled={uploading}
        >
          {profileImage ? 'Bild ändern' : 'Bild hochladen'}
        </button>
      </div>
    </div>
  );
}

// Password Change Component
function PasswordChangeSection() {
  const { changePassword } = useAuth();
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const handleInputChange = (field, value) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
    // Clear errors when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    setSuccess(false);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Aktuelles Passwort ist erforderlich';
    }
    
    if (!passwordData.newPassword) {
      newErrors.newPassword = 'Neues Passwort ist erforderlich';
    }
    
    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwort-Bestätigung ist erforderlich';
    }
    
    if (passwordData.newPassword && passwordData.confirmPassword && 
        passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwörter stimmen nicht überein';
    }
    
    if (passwordData.currentPassword && passwordData.newPassword && 
        passwordData.currentPassword === passwordData.newPassword) {
      newErrors.newPassword = 'Neues Passwort muss sich vom aktuellen unterscheiden';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      await changePassword(passwordData.currentPassword, passwordData.newPassword);
      setSuccess(true);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setTimeout(() => setSuccess(false), 5000);
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="password-change-section">
      <h3>Passwort ändern</h3>
      
      {success && (
        <div className="success-message">
          ✅ Passwort erfolgreich geändert!
        </div>
      )}
      
      {errors.submit && (
        <div className="error-message">
          ❌ {errors.submit}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="password-form">
        <div className="form-group">
          <label htmlFor="current-password">Aktuelles Passwort</label>
          <input
            type="password"
            id="current-password"
            value={passwordData.currentPassword}
            onChange={(e) => handleInputChange('currentPassword', e.target.value)}
            className={errors.currentPassword ? 'error' : ''}
            disabled={loading}
          />
          {errors.currentPassword && (
            <span className="field-error">{errors.currentPassword}</span>
          )}
        </div>
        
        <div className="form-group">
          <label htmlFor="new-password">Neues Passwort</label>
          <input
            type="password"
            id="new-password"
            value={passwordData.newPassword}
            onChange={(e) => handleInputChange('newPassword', e.target.value)}
            className={errors.newPassword ? 'error' : ''}
            disabled={loading}
          />
          {errors.newPassword && (
            <span className="field-error">{errors.newPassword}</span>
          )}
          <div className="password-requirements">
            <small>
              Mindestens 8 Zeichen, Groß- und Kleinbuchstaben, Zahlen und Sonderzeichen
            </small>
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="confirm-password">Neues Passwort bestätigen</label>
          <input
            type="password"
            id="confirm-password"
            value={passwordData.confirmPassword}
            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
            className={errors.confirmPassword ? 'error' : ''}
            disabled={loading}
          />
          {errors.confirmPassword && (
            <span className="field-error">{errors.confirmPassword}</span>
          )}
        </div>
        
        <button 
          type="submit" 
          className="btn-save-password"
          disabled={loading}
        >
          {loading ? 'Passwort wird geändert...' : 'Passwort ändern'}
        </button>
      </form>
    </div>
  );
}

// User Info Section Component
function UserInfoSection({ user, onSave, loading }) {
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || '',
    title: user.profile?.title || '',
    department: user.profile?.department || '',
    phone: user.profile?.phone || '',
    bio: user.profile?.bio || ''
  });

  const handleSave = async () => {
    await onSave(formData);
    setEditing(false);
  };

  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'admin': return 'Administrator';
      case 'teacher': return 'Lehrer';
      case 'student': return 'Schüler';
      default: return role;
    }
  };

  const getRoleBadgeClass = (role) => {
    return `role-badge ${role}`;
  };

  return (
    <div className="user-info-section">
      <div className="user-header">
        <h2>{user.name || user.email}</h2>
        <span className={getRoleBadgeClass(user.role)}>
          {getRoleDisplayName(user.role)}
        </span>
        <button 
          className="btn-edit"
          onClick={() => setEditing(!editing)}
        >
          {editing ? 'Abbrechen' : 'Bearbeiten'}
        </button>
      </div>

      <div className="user-details">
        <div className="detail-group">
          <label>Name</label>
          {editing ? (
            <input 
              type="text" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          ) : (
            <span>{user.name || 'Nicht angegeben'}</span>
          )}
        </div>

        <div className="detail-group">
          <label>E-Mail</label>
          {editing ? (
            <input 
              type="email" 
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          ) : (
            <span>{user.email}</span>
          )}
        </div>

        <div className="detail-group">
          <label>Titel</label>
          {editing ? (
            <input 
              type="text" 
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="z.B. Dr., Prof."
            />
          ) : (
            <span>{user.profile?.title || 'Nicht angegeben'}</span>
          )}
        </div>

        <div className="detail-group">
          <label>Abteilung</label>
          {editing ? (
            <input 
              type="text" 
              value={formData.department}
              onChange={(e) => setFormData({...formData, department: e.target.value})}
              placeholder="z.B. Mathematik, Deutsch"
            />
          ) : (
            <span>{user.profile?.department || 'Nicht angegeben'}</span>
          )}
        </div>

        <div className="detail-group">
          <label>Telefon</label>
          {editing ? (
            <input 
              type="tel" 
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              placeholder="Telefonnummer"
            />
          ) : (
            <span>{user.profile?.phone || 'Nicht angegeben'}</span>
          )}
        </div>

        <div className="detail-group">
          <label>Über mich</label>
          {editing ? (
            <textarea 
              value={formData.bio}
              onChange={(e) => setFormData({...formData, bio: e.target.value})}
              placeholder="Kurze Beschreibung über Sie"
              rows={3}
            />
          ) : (
            <span>{user.profile?.bio || 'Nicht angegeben'}</span>
          )}
        </div>

        {editing && (
          <div className="edit-actions">
            <button 
              className="btn-save"
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? 'Speichern...' : 'Speichern'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Main Profile Component
function Profile() {
  const { currentUser, updateUserProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  const handleSave = async (formData) => {
    setLoading(true);
    setMessage('');
    
    try {
      await updateUserProfile(formData);
      setMessage('Profil erfolgreich aktualisiert!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Fehler beim Speichern: ' + error.message);
      setTimeout(() => setMessage(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpdate = (imageUrl) => {
    // Update user profile with new image URL
    handleSave({ profileImage: imageUrl });
  };

  if (!currentUser) {
    return <div>Laden...</div>;
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header-section">
          <h1>Profil & Einstellungen</h1>
          {isDemoMode() && <RoleSwitcher />}
        </div>

        {message && (
          <div className={`message ${message.includes('Fehler') ? 'error' : 'success'}`}>
            {message}
          </div>
        )}

        {/* Profile Image Section */}
        <ProfileImageSection 
          user={currentUser} 
          onImageUpdate={handleImageUpdate}
        />

        {/* User Information Section */}
        <UserInfoSection 
          user={currentUser} 
          onSave={handleSave}
          loading={loading}
        />

        {/* Password Change Section */}
        <PasswordChangeSection />
      </div>
    </div>
  );
}

export default Profile;
