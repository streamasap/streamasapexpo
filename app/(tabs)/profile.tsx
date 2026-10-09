import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Switch,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const insets = useSafeAreaInsets();
  const bottomPadding = 58 + Math.max(insets.bottom, 10) + 24;

  const [autoplayNext, setAutoplayNext] = useState(true);
  const [autoplayPreviews, setAutoplayPreviews] = useState(true);

  // Modals state
  const [menuVisible, setMenuVisible] = useState(false);
  const [showConfirmSignOut, setShowConfirmSignOut] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

   // Format Join Date from PostgreSQL createdAt timestamp
  const formatJoinDate = (dateString?: string) => {
    if (!dateString) return 'Member since 2026';
    try {
      const date = new Date(dateString);
      return `Member since ${date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })}`;
    } catch {
      return 'Member since 2026';
    }
  };

  // Dynamic user data variables
  const displayName = user?.name || 'User';
  const displayPhone = user?.phone || 'No phone attached';
  const displayJoinDate = formatJoinDate(user?.joinDate);

  const handleOpenSignOutPrompt = () => {
    setMenuVisible(false);
    setShowConfirmSignOut(true);
  };

  const handleConfirmSignOut = async () => {
    try {
      setIsSigningOut(true);
      if (signOut) {
        await signOut();
      }
      setShowConfirmSignOut(false);
      router.replace('/(auth)/login' as any);
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Profile</Text>
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.moreBtn}
            onPress={() => setMenuVisible(true)}>
            <Ionicons name="ellipsis-horizontal" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <Text style={styles.headerSubtitle}>
          Manage your account information and security
        </Text>
      </View>

      {/* 3-Dot Dropdown Menu Modal */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={[styles.menuDropdown, { top: insets.top + 48 }]}>
              <TouchableOpacity
                style={styles.menuItem}
                activeOpacity={0.7}
                onPress={handleOpenSignOutPrompt}>
                <Ionicons name="log-out-outline" size={18} color="#EF4444" />
                <Text style={styles.menuItemTextDestructive}>Sign Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Custom Logout Confirmation Modal */}
      <Modal
        visible={showConfirmSignOut}
        transparent
        animationType="fade"
        onRequestClose={() => setShowConfirmSignOut(false)}>
        <TouchableWithoutFeedback onPress={() => setShowConfirmSignOut(false)}>
          <View style={styles.confirmOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.confirmBox}>
                <View style={styles.warningIconCircle}>
                  <Ionicons name="log-out-outline" size={28} color="#EF4444" />
                </View>

                <Text style={styles.confirmTitle}>Sign Out?</Text>
                <Text style={styles.confirmSubtitle}>
                  Are you sure you want to sign out of your account? You will need to log back in to watch.
                </Text>

                <View style={styles.confirmActionsRow}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.cancelBtn}
                    onPress={() => setShowConfirmSignOut(false)}
                    disabled={isSigningOut}>
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.confirmSignOutBtn}
                    onPress={handleConfirmSignOut}
                    disabled={isSigningOut}>
                    <Text style={styles.confirmSignOutBtnText}>
                      {isSigningOut ? 'Signing out...' : 'Sign Out'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: bottomPadding },
        ]}
        showsVerticalScrollIndicator={false}
        bounces={false}
        overScrollMode="never">

        {/* User Info Header Card with Dynamic Data */}
        <View style={styles.profileCard}>
          <View style={styles.userInfoRow}>
            <Image
              source={{
                uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
              }}
              style={styles.avatar}
            />
            <View style={styles.userDetails}>
              <View style={styles.nameBadgeRow}>
                <Text style={styles.userName}>{displayName}</Text>
                <View style={styles.planBadge}>
                  <Text style={styles.planBadgeText}>User plan</Text>
                </View>
              </View>
              <Text style={styles.userPhone}>{displayPhone}</Text>
              <Text style={styles.memberSince}>{displayJoinDate}</Text>
            </View>

            <TouchableOpacity activeOpacity={0.8} style={styles.editProfileBtn}>
              <Text style={styles.editProfileText}>Edit profile</Text>
            </TouchableOpacity>
          </View>

          {/* Quick Action Pills */}
          <View style={styles.profileActionsRow}>
            <TouchableOpacity activeOpacity={0.8} style={styles.actionPillOutline}>
              <Text style={styles.actionPillOutlineText}>Add Email address</Text>
            </TouchableOpacity>

            <TouchableOpacity activeOpacity={0.8} style={styles.actionPillOutline}>
              <Text style={styles.actionPillOutlineText}>Set a Password</Text>
            </TouchableOpacity>

            <TouchableOpacity activeOpacity={0.8} style={styles.actionPillFilled}>
              <Text style={styles.actionPillFilledText}>Manage Subscription</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Subscription Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Subscription</Text>

          <View style={styles.subscriptionCard}>
            <View style={styles.subLeftInfo}>
              <Text style={styles.subPlanText}>
                You are on a USER PLAN • 17,800/yearly
              </Text>
              <Text style={styles.subBillingText}>
                Next billing date: Jan 13, 2027
              </Text>

              <TouchableOpacity activeOpacity={0.8} style={styles.subManageBtn}>
                <Text style={styles.subManageBtnText}>Manage Subscription</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.perksBox}>
              <Text style={styles.perkItem}>• Full access to Movies, Live sports & Shorts</Text>
              <Text style={styles.perkItem}>• No-ads on Movies or Live sports</Text>
              <Text style={styles.perkItem}>• HD & Full quality</Text>
              <Text style={styles.perkItem}>• Download & watch offline</Text>
              <Text style={styles.perkItem}>• Upload & go live on Shorts</Text>
            </View>
          </View>
        </View>

        {/* Playback Settings */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Playback Settings</Text>

          <View style={styles.settingRow}>
            <View>
              <Text style={styles.settingLabel}>Video Quality</Text>
              <Text style={styles.settingSubLabel}>Choose the default quality for streaming</Text>
            </View>
            <TouchableOpacity activeOpacity={0.8} style={styles.dropdownBtn}>
              <Text style={styles.dropdownText}>Auto (Recommended)</Text>
              <Ionicons name="chevron-down" size={14} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          <View style={styles.settingRow}>
            <View>
              <Text style={styles.settingLabel}>Playback Speed</Text>
              <Text style={styles.settingSubLabel}>Choose the default playback speed</Text>
            </View>
            <TouchableOpacity activeOpacity={0.8} style={styles.dropdownBtn}>
              <Text style={styles.dropdownText}>1.0x</Text>
              <Ionicons name="chevron-down" size={14} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          <View style={styles.toggleRow}>
            <View style={styles.toggleLabelBox}>
              <Text style={styles.settingLabel}>Autoplay Next Episode</Text>
              <Text style={styles.settingSubLabel}>Automatically play next episode in a series</Text>
            </View>
            <Switch
              value={autoplayNext}
              onValueChange={setAutoplayNext}
              trackColor={{ false: '#262838', true: '#3B82F6' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.toggleRow}>
            <View style={styles.toggleLabelBox}>
              <Text style={styles.settingLabel}>Autoplay Previews</Text>
              <Text style={styles.settingSubLabel}>Play previews while browsing</Text>
            </View>
            <Switch
              value={autoplayPreviews}
              onValueChange={setAutoplayPreviews}
              trackColor={{ false: '#262838', true: '#3B82F6' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Downloads Settings */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Downloads Settings</Text>
          <View style={styles.settingRow}>
            <View>
              <Text style={styles.settingLabel}>Download Quality</Text>
              <Text style={styles.settingSubLabel}>Choose the standard download resolution</Text>
            </View>
            <TouchableOpacity activeOpacity={0.8} style={styles.dropdownBtn}>
              <Text style={styles.dropdownText}>Standard (720p)</Text>
              <Ionicons name="chevron-down" size={14} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#05060A',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    position: 'relative',
    backgroundColor: '#05060A',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#9CA3AF',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  moreBtn: {
    position: 'absolute',
    right: 20,
    top: 16,
    padding: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  menuDropdown: {
    position: 'absolute',
    right: 20,
    width: 150,
    backgroundColor: '#181A26',
    borderRadius: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#2A2D40',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    gap: 10,
  },
  menuItemTextDestructive: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '600',
  },
  confirmOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  confirmBox: {
    width: '100%',
    backgroundColor: '#0E101A',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#222538',
  },
  warningIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  confirmTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  confirmSubtitle: {
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 24,
  },
  confirmActionsRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  cancelBtn: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#181A28',
    borderWidth: 1,
    borderColor: '#2A2D42',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#D1D5DB',
    fontSize: 14,
    fontWeight: '600',
  },
  confirmSignOutBtn: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmSignOutBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  profileCard: {
    backgroundColor: '#0B0C14',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#181926',
  },
  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#4F46E5',
  },
  userDetails: {
    flex: 1,
    marginLeft: 12,
  },
  nameBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  planBadge: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  planBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
  userPhone: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },
  memberSince: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 2,
  },
  editProfileBtn: {
    backgroundColor: '#1E2235',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  editProfileText: {
    color: '#60A5FA',
    fontSize: 11,
    fontWeight: '600',
  },
  profileActionsRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  actionPillOutline: {
    backgroundColor: '#121420',
    borderWidth: 1,
    borderColor: '#24273A',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  actionPillOutlineText: {
    color: '#D1D5DB',
    fontSize: 11,
    fontWeight: '500',
  },
  actionPillFilled: {
    backgroundColor: '#1E2640',
    borderWidth: 1,
    borderColor: '#3B82F6',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  actionPillFilledText: {
    color: '#60A5FA',
    fontSize: 11,
    fontWeight: '600',
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  subscriptionCard: {
    flexDirection: 'row',
    backgroundColor: '#0B0C14',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#181926',
    gap: 12,
  },
  subLeftInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  subPlanText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 16,
  },
  subBillingText: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 4,
    marginBottom: 12,
  },
  subManageBtn: {
    backgroundColor: '#1C2136',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  subManageBtnText: {
    color: '#818CF8',
    fontSize: 11,
    fontWeight: '600',
  },
  perksBox: {
    flex: 1.1,
    backgroundColor: '#070912',
    borderRadius: 10,
    padding: 10,
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#181A2A',
  },
  perkItem: {
    color: '#9CA3AF',
    fontSize: 9,
    lineHeight: 12,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0B0C14',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#181926',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0B0C14',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#181926',
  },
  toggleLabelBox: {
    flex: 1,
    paddingRight: 10,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  settingSubLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  dropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#151722',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  dropdownText: {
    color: '#D1D5DB',
    fontSize: 11,
    fontWeight: '500',
  },
});