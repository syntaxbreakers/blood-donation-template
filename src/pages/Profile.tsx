import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, query, where, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { deleteUser } from 'firebase/auth';
import { db } from '../firebase';
import { Edit2, Settings, LogOut, PlusCircle, Calendar, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { useLocations } from '../hooks/useLocations';
import styles from './Profile.module.css';

export const Profile: React.FC = () => {
  const { user, userData, signOut } = useAuth();
  const navigate = useNavigate();
  const [isPublishing, setIsPublishing] = useState(false);
  const [message, setMessage] = useState('');

  const [myPosts, setMyPosts] = useState<any[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);

  const [showCampForm, setShowCampForm] = useState(false);
  const [editingCampId, setEditingCampId] = useState<string | null>(null);
  const [myCamps, setMyCamps] = useState<any[]>([]);

  const [requestData, setRequestData] = useState({
    bloodGroup: '',
    state: '',
    district: '',
    phone: '',
    building: '',
    fullAddress: ''
  });

  const [campData, setCampData] = useState({
    state: '',
    district: '',
    campDate: '',
    stock: [] as string[],
    building: '',
    fullAddress: ''
  });

  const { states: apiStates, districts: apiDistricts, fetchDistricts, loadingStates, loadingDistricts } = useLocations();

  React.useEffect(() => {
    if (userData && !requestData.bloodGroup && !requestData.state) {
      setRequestData({
        bloodGroup: userData.bloodGroup || '',
        state: (userData as any).state || '',
        district: (userData as any).district || '',
        phone: (userData as any).phone || '',
        building: '',
        fullAddress: ''
      });
    }
  }, [userData]);

  React.useEffect(() => {
    fetchDistricts(requestData.state);
  }, [requestData.state]);

  React.useEffect(() => {
    fetchDistricts(campData.state);
  }, [campData.state]);

  React.useEffect(() => {
    if (user?.uid) {
      if (userData?.role === 'donor') {
        fetchMyPosts();
      } else {
        fetchMyCamps();
      }
    }
  }, [user, userData]);

  const fetchMyCamps = async () => {
    setLoadingPosts(true);
    try {
      const q = query(collection(db, 'camps'), where('uid', '==', user?.uid));
      const snapshot = await getDocs(q);
      setMyCamps(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingPosts(false);
    }
  };

  const fetchMyPosts = async () => {
    setLoadingPosts(true);
    try {
      const q = query(collection(db, 'posts'), where('uid', '==', user?.uid));
      const snapshot = await getDocs(q);
      setMyPosts(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingPosts(false);
    }
  };

  // Redirect if not logged in (moved below hooks to satisfy Rules of Hooks)
  if (!userData) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem' }}>
        <h2>Please log in to view your profile.</h2>
        <Button style={{ marginTop: '1rem' }} onClick={() => navigate('/login')}>Log In</Button>
      </div>
    );
  }

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) return;
    try {
      if (user) {
        await deleteDoc(doc(db, 'users', user.uid));
        await deleteUser(user);
        navigate('/');
      }
    } catch (err: any) {
      setMessage('Failed to delete account. Please try logging in again to verify deletion.');
      console.error(err);
    }
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !userData) return;
    setIsPublishing(true);
    setMessage('');
    try {
      const addressString = [requestData.building, requestData.fullAddress, requestData.district, requestData.state].filter(Boolean).join(', ');

      if (editingPostId) {
        await updateDoc(doc(db, 'posts', editingPostId), {
          bloodGroup: requestData.bloodGroup,
          address: addressString,
          phone: requestData.phone,
        });
        setMessage('Blood request updated successfully!');
      } else {
        await addDoc(collection(db, 'posts'), {
          uid: user.uid,
          fullName: userData.fullName,
          bloodGroup: requestData.bloodGroup,
          address: addressString,
          phone: requestData.phone,
          createdAt: Date.now(),
          expiresAt: Date.now() + 24 * 60 * 60 * 1000
        });
        setMessage('Blood request posted successfully to the live feed!');
      }

      setShowRequestForm(false);
      setEditingPostId(null);
      fetchMyPosts();
    } catch (err) {
      setMessage('Failed to process post. Check permissions.');
    } finally {
      setIsPublishing(false);
      setTimeout(() => setMessage(''), 4000);
    }
  };

  const handleEditClick = (post: any) => {
    setEditingPostId(post.id);
    const parts = post.address?.split(', ') || [];
    const pState = parts.length > 0 ? parts[parts.length - 1] : '';
    const pDistrict = parts.length > 1 ? parts[parts.length - 2] : '';
    const pBuilding = parts.length > 2 ? parts[0] : '';
    const pAddress = parts.length > 3 ? parts.slice(1, parts.length - 2).join(', ') : (parts.length > 2 ? '' : '');

    setRequestData({
      bloodGroup: post.bloodGroup || '',
      state: pState,
      district: pDistrict,
      phone: post.phone || '',
      building: pBuilding,
      fullAddress: pAddress
    });
    setShowRequestForm(true);
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    try {
      await deleteDoc(doc(db, 'posts', postId));
      setMessage('Post deleted.');
      fetchMyPosts();
    } catch {
      setMessage('Failed to delete post.');
    }
  };

  const handleHostCamp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !userData) return;
    setIsPublishing(true);
    setMessage('');
    try {
      const addressString = [campData.building, campData.fullAddress, campData.district, campData.state].filter(Boolean).join(', ');

      if (editingCampId) {
        await updateDoc(doc(db, 'camps', editingCampId), {
          address: addressString,
          campDate: campData.campDate,
          stock: campData.stock
        });
        setMessage('Camp updated successfully!');
      } else {
        await addDoc(collection(db, 'camps'), {
          uid: user.uid,
          bankName: userData.fullName,
          address: addressString,
          campDate: campData.campDate,
          stock: campData.stock,
          createdAt: Date.now(),
        });
        setMessage('Camp hosted successfully! Check the live feed.');
      }
      setShowCampForm(false);
      setEditingCampId(null);
      fetchMyCamps();
    } catch (err) {
      setMessage('Failed to process camp. Check permissions.');
    } finally {
      setIsPublishing(false);
      setTimeout(() => setMessage(''), 4000);
    }
  };

  const handleEditCampClick = (camp: any) => {
    setEditingCampId(camp.id);
    const parts = camp.address?.split(', ') || [];
    const pState = parts.length > 0 ? parts[parts.length - 1] : '';
    const pDistrict = parts.length > 1 ? parts[parts.length - 2] : '';
    const pBuilding = parts.length > 2 ? parts[0] : '';
    const pAddress = parts.length > 3 ? parts.slice(1, parts.length - 2).join(', ') : '';

    setCampData({
      state: pState,
      district: pDistrict,
      campDate: camp.campDate || '',
      stock: camp.stock || [],
      building: pBuilding,
      fullAddress: pAddress
    });
    setShowCampForm(true);
  };

  const handleDeleteCamp = async (campId: string) => {
    if (!confirm('Are you sure you want to delete this camp?')) return;
    try {
      await deleteDoc(doc(db, 'camps', campId));
      setMessage('Camp deleted.');
      fetchMyCamps();
    } catch {
      setMessage('Failed to delete camp.');
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.profileLayout}>
        {/* Top Header Card */}
        <Card className={styles.headerCard}>
          <div className={styles.profileInfo}>
            <div className={styles.avatar}>
              {userData.fullName?.charAt(0) || 'U'}
            </div>
            <div className={styles.nameBlock}>
              <h2>{userData.fullName}</h2>
              <p>{userData.role === 'bank' ? 'Blood Bank' : 'Blood Donor'}</p>
            </div>
          </div>
          <div>
            <Button variant="outline" leftIcon={<Edit2 size={16} />} onClick={() => navigate('/edit-profile')}>
              Edit Profile
            </Button>
          </div>
        </Card>

        {/* Left Column: About/Details */}
        <Card>
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={styles.detailsList}>
              <div className={styles.detailItem}>
                <div className={styles.detailLabel}>Full Name</div>
                <div className={styles.detailValue}>{userData.fullName}</div>
              </div>
              <div className={styles.detailItem}>
                <div className={styles.detailLabel}>Email</div>
                <div className={styles.detailValue}>{userData.email}</div>
              </div>
              <div className={styles.detailItem}>
                <div className={styles.detailLabel}>Blood Group</div>
                <div className={styles.detailValue}>{userData.bloodGroup || 'Not specified'}</div>
              </div>
              <div className={styles.detailItem}>
                <div className={styles.detailLabel}>Role</div>
                <div className={styles.detailValue} style={{ textTransform: 'capitalize' }}>
                  {userData.role}
                </div>
              </div>
              {(userData as any).phone && (
                <div className={styles.detailItem}>
                  <div className={styles.detailLabel}>Phone</div>
                  <div className={styles.detailValue}>{(userData as any).phone}</div>
                </div>
              )}
              {((userData as any).state || (userData as any).district) && (
                <div className={styles.detailItem}>
                  <div className={styles.detailLabel}>Location</div>
                  <div className={styles.detailValue}>
                    {[(userData as any).district, (userData as any).state].filter(Boolean).join(', ')}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Dynamic Forms / My Posts / Camps */}
        {(showRequestForm || showCampForm || myPosts.length > 0 || myCamps.length > 0) && (
          <Card>
            <CardHeader>
              <CardTitle>
                {showRequestForm ? (editingPostId ? 'Edit Urgent Request' : 'Create Urgent Request') :
                  showCampForm ? (editingCampId ? 'Edit Blood Camp' : 'Host Blood Camp') :
                    userData.role === 'donor' ? 'My Posts' : 'My Camps'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {showRequestForm ? (
                <form onSubmit={handleCreateRequest} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <Select
                    label="Blood Group Required"
                    value={requestData.bloodGroup}
                    onChange={e => setRequestData({ ...requestData, bloodGroup: e.target.value })}
                    options={[
                      { value: '', label: 'Select Blood Group' },
                      { value: 'A+', label: 'A+' }, { value: 'A-', label: 'A-' },
                      { value: 'B+', label: 'B+' }, { value: 'B-', label: 'B-' },
                      { value: 'AB+', label: 'AB+' }, { value: 'AB-', label: 'AB-' },
                      { value: 'O+', label: 'O+' }, { value: 'O-', label: 'O-' },
                    ]}
                    required
                  />
                  <Select
                    label="State"
                    value={requestData.state}
                    onChange={e => setRequestData({ ...requestData, state: e.target.value, district: '' })}
                    options={[
                      { value: '', label: loadingStates ? 'Loading...' : 'Select State' },
                      ...apiStates.map(s => ({ value: s.state_name, label: s.state_name }))
                    ]}
                    required
                  />
                  <Select
                    label="District"
                    value={requestData.district}
                    onChange={e => setRequestData({ ...requestData, district: e.target.value })}
                    options={[
                      { value: '', label: loadingDistricts ? 'Loading...' : 'Select District' },
                      ...apiDistricts.map(d => ({ value: d.district_name, label: d.district_name }))
                    ]}
                    disabled={!requestData.state || loadingDistricts}
                    required
                  />
                  <Input
                    label="Building / Hospital Name"
                    type="text"
                    value={requestData.building}
                    onChange={e => setRequestData({ ...requestData, building: e.target.value })}
                    placeholder="e.g. Apollo Hospital"
                    required
                  />
                  <Input
                    label="Full Address (Street, Area)"
                    type="text"
                    value={requestData.fullAddress}
                    onChange={e => setRequestData({ ...requestData, fullAddress: e.target.value })}
                    placeholder="e.g. Jubilee Hills, Road No 36"
                    required
                  />
                  <Input
                    label="Contact Phone"
                    type="tel"
                    value={requestData.phone}
                    onChange={e => setRequestData({ ...requestData, phone: e.target.value })}
                    placeholder="Enter phone number"
                    required
                  />
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '1rem' }}>
                    <Button type="submit" variant="primary" disabled={isPublishing}>
                      {isPublishing ? 'Publishing...' : (editingPostId ? 'Update Request' : 'Post Request')}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => { setShowRequestForm(false); setEditingPostId(null); }}>
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : showCampForm ? (
                <form onSubmit={handleHostCamp} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <Input
                    label="Camp Date"
                    type="date"
                    value={campData.campDate}
                    onChange={e => setCampData({ ...campData, campDate: e.target.value })}
                    required
                  />
                  <Select
                    label="State"
                    value={campData.state}
                    onChange={e => setCampData({ ...campData, state: e.target.value, district: '' })}
                    options={[
                      { value: '', label: loadingStates ? 'Loading...' : 'Select State' },
                      ...apiStates.map(s => ({ value: s.state_name, label: s.state_name }))
                    ]}
                    required
                  />
                  <Select
                    label="District"
                    value={campData.district}
                    onChange={e => setCampData({ ...campData, district: e.target.value })}
                    options={[
                      { value: '', label: loadingDistricts ? 'Loading...' : 'Select District' },
                      ...apiDistricts.map(d => ({ value: d.district_name, label: d.district_name }))
                    ]}
                    disabled={!campData.state || loadingDistricts}
                    required
                  />
                  <Input
                    label="Building / Location Name"
                    type="text"
                    value={campData.building}
                    onChange={e => setCampData({ ...campData, building: e.target.value })}
                    placeholder="e.g. Community Hall"
                    required
                  />
                  <Input
                    label="Full Address (Street, Area)"
                    type="text"
                    value={campData.fullAddress}
                    onChange={e => setCampData({ ...campData, fullAddress: e.target.value })}
                    placeholder="e.g. MG Road, Block A"
                    required
                  />
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem', color: 'var(--text-main)' }}>Accepted Blood Groups</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                        <label key={bg} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'var(--bg-color)', padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-full)', fontSize: '0.85rem', cursor: 'pointer', border: '1px solid var(--border-light)' }}>
                          <input
                            type="checkbox"
                            checked={campData.stock.includes(bg)}
                            onChange={(e) => {
                              if (e.target.checked) setCampData({ ...campData, stock: [...campData.stock, bg] });
                              else setCampData({ ...campData, stock: campData.stock.filter(s => s !== bg) });
                            }}
                          />
                          {bg}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '1rem' }}>
                    <Button type="submit" variant="primary" disabled={isPublishing}>
                      {isPublishing ? 'Publishing...' : (editingCampId ? 'Update Camp' : 'Host Camp')}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => { setShowCampForm(false); setEditingCampId(null); }}>
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : userData.role === 'donor' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {loadingPosts ? <p>Loading posts...</p> : (
                    myPosts.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>You have no active posts.</p> :
                      myPosts.map(post => (
                        <div key={post.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)' }}>
                          <div>
                            <strong>{post.bloodGroup}</strong> required at {post.address}
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Contact: {post.phone}</div>
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1rem' }}>
                            <Button variant="outline" size="sm" onClick={() => handleEditClick(post)} leftIcon={<Edit2 size={14} />}>Edit</Button>
                            <Button variant="outline" size="sm" style={{ color: 'var(--blood-primary)', borderColor: 'var(--blood-primary)' }} onClick={() => handleDeletePost(post.id)} leftIcon={<Trash2 size={14} />}>Delete</Button>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {loadingPosts ? <p>Loading camps...</p> : (
                    myCamps.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>You have no active camps.</p> :
                      myCamps.map(camp => (
                        <div key={camp.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)' }}>
                          <div>
                            <strong>Camp on {camp.campDate}</strong> at {camp.address}
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                              Accepting: {camp.stock?.length > 0 ? camp.stock.join(', ') : 'All Blood Groups'}
                            </div>
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1rem' }}>
                            <Button variant="outline" size="sm" onClick={() => handleEditCampClick(camp)} leftIcon={<Edit2 size={14} />}>Edit</Button>
                            <Button variant="outline" size="sm" style={{ color: 'var(--blood-primary)', borderColor: 'var(--blood-primary)' }} onClick={() => handleDeleteCamp(camp.id)} leftIcon={<Trash2 size={14} />}>Delete</Button>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Right Column: Mini actions/Stats */}
        <div>
          {message && (
            <div style={{ padding: '0.75rem 1rem', background: 'var(--action-green-hover)', color: 'white', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              {message}
            </div>
          )}

          <Card style={{ marginBottom: '1.5rem' }}>
            <CardContent style={{ padding: '1.5rem' }}>
              {userData.role === 'donor' ? (
                <Button
                  variant="primary"
                  fullWidth
                  style={{ marginBottom: '1rem', justifyContent: 'center' }}
                  leftIcon={<PlusCircle size={18} />}
                  onClick={() => {
                    setEditingPostId(null);
                    setShowRequestForm(true);
                  }}
                  disabled={showRequestForm}
                >
                  Request Blood Urgent
                </Button>
              ) : (
                <Button
                  variant="success"
                  fullWidth
                  style={{ marginBottom: '1rem', justifyContent: 'center' }}
                  leftIcon={<Calendar size={18} />}
                  onClick={() => {
                    setEditingCampId(null);
                    setCampData({ ...campData, campDate: new Date().toISOString().split('T')[0], stock: [] });
                    setShowCampForm(true);
                  }}
                  disabled={showCampForm}
                >
                  {isPublishing ? 'Hosting...' : 'Host Donation Camp'}
                </Button>
              )}

              <Button variant="ghost" fullWidth style={{ justifyContent: 'flex-start' }} leftIcon={<Settings size={18} />}>
                Account Settings
              </Button>
              <Button variant="ghost" fullWidth style={{ justifyContent: 'flex-start', color: 'var(--blood-primary)' }} leftIcon={<LogOut size={18} />} onClick={handleLogout}>
                Log Out
              </Button>
              <Button variant="ghost" fullWidth style={{ justifyContent: 'flex-start', color: 'red', marginTop: '0.5rem' }} leftIcon={<Trash2 size={18} />} onClick={handleDeleteAccount}>
                Delete Account
              </Button>
            </CardContent>
          </Card>

          {userData.role === 'donor' && (
            <Card>
              <CardHeader>
                <CardTitle style={{ fontSize: '1rem' }}>Donation Status</CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const isComplete = userData.fullName && userData.email && userData.bloodGroup && (userData as any).phone && (userData as any).state && (userData as any).district;
                  if (isComplete) {
                    return (
                      <div style={{ padding: '1rem', background: 'var(--action-green-hover)', color: 'white', borderRadius: 'var(--radius-md)', textAlign: 'center', fontWeight: '500' }}>
                        Eligible to Donate
                      </div>
                    );
                  } else {
                    return (
                      <div style={{ padding: '1rem', background: 'var(--text-muted)', color: 'white', borderRadius: 'var(--radius-md)', textAlign: 'center', fontWeight: '500' }}>
                        Incomplete Profile - Not Eligible
                      </div>
                    );
                  }
                })()}
              </CardContent>
            </Card>
          )}
        </div>

      </div>
    </div>
  );
};
