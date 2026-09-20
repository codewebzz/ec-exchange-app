import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Dimensions,
  StatusBar,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { APP_CONFIG } from '../config/appConfig';

const { width } = Dimensions.get('window');

const DOWNLOAD_URL = APP_CONFIG.downloadApkUrl;

interface UpdateRequiredScreenProps {
  clientVersion: string;
  latestVersion?: string;
  downloadUrl?: string;
  onRetry?: () => void;
}

const UpdateRequiredScreen: React.FC<UpdateRequiredScreenProps> = ({
  clientVersion,
  latestVersion,
  downloadUrl,
  onRetry,
}) => {
  const [copied, setCopied] = useState(false);

  const handleDownload = async () => {
    const targetUrl = downloadUrl || DOWNLOAD_URL;
    try {
      const supported = await Linking.canOpenURL(targetUrl);
      if (supported) {
        await Linking.openURL(targetUrl);
      } else {
        await Linking.openURL(targetUrl);
      }
    } catch (err) {
      console.error('Failed to open download URL:', err);
    }
  };

  const handleCopyLink = () => {
    const targetUrl = downloadUrl || DOWNLOAD_URL;
    try {
      const { Clipboard } = require('react-native');
      Clipboard.setString(targetUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.warn('Failed to copy link:', err);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#0b1221" barStyle="light-content" />

      {/* Card */}
      <View style={styles.card}>
        <View style={styles.iconCircle}>
          <Ionicons name="cloud-download-outline" size={48} color="#38BDF8" />
        </View>

        <Text style={styles.title}>Update Available</Text>
        <Text style={styles.subtitle}>
          A new version of EcExchange is ready. Please update to continue using the app.
        </Text>

        {/* Version Info Badge */}
        <View style={styles.versionContainer}>
          <View style={styles.versionBadge}>
            <Text style={styles.versionLabel}>Installed</Text>
            <Text style={styles.versionValue}>v{clientVersion}</Text>
          </View>
          <Ionicons name="arrow-forward" size={16} color="#94A3B8" />
          <View style={[styles.versionBadge, styles.latestBadge]}>
            <Text style={styles.versionLabelLatest}>Latest</Text>
            <Text style={styles.versionValueLatest}>
              v{latestVersion || 'Latest'}
            </Text>
          </View>
        </View>

        {/* Download Button */}
        <TouchableOpacity
          style={styles.downloadButton}
          onPress={handleDownload}
          activeOpacity={0.8}
        >
          <Ionicons name="download-outline" size={20} color="#FFFFFF" style={styles.downloadIcon} />
          <Text style={styles.downloadButtonText}>Download Latest Update</Text>
        </TouchableOpacity>

        {/* Copy Download Link Button */}
        <TouchableOpacity
          style={[styles.copyButton, copied && styles.copyButtonActive]}
          onPress={handleCopyLink}
          activeOpacity={0.7}
        >
          <Ionicons
            name={copied ? 'checkmark-circle-outline' : 'copy-outline'}
            size={18}
            color={copied ? '#10B981' : '#38BDF8'}
            style={styles.copyIcon}
          />
          <Text style={[styles.copyButtonText, copied && styles.copyButtonTextActive]}>
            {copied ? 'Download Link Copied!' : 'Copy Download Link'}
          </Text>
        </TouchableOpacity>

        {/* Optional Retry check */}
        {onRetry && (
          <TouchableOpacity style={styles.retryButton} onPress={onRetry} activeOpacity={0.7}>
            <Text style={styles.retryButtonText}>Check Again</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.footerNote}>
        Direct download from verified server
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b1220',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: Math.min(width - 48, 380),
    backgroundColor: '#1E293B',
    borderRadius: 24,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(56, 189, 248, 0.3)',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#F8FAFC',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  versionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    width: '100%',
    marginBottom: 24,
    gap: 12,
  },
  versionBadge: {
    alignItems: 'center',
  },
  versionLabel: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 2,
    fontWeight: '500',
  },
  versionValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#CBD5E1',
  },
  latestBadge: {
    alignItems: 'center',
  },
  versionLabelLatest: {
    fontSize: 11,
    color: '#38BDF8',
    marginBottom: 2,
    fontWeight: '600',
  },
  versionValueLatest: {
    fontSize: 14,
    fontWeight: '700',
    color: '#38BDF8',
  },
  downloadIcon: {
    marginRight: 8,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0284C7',
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  downloadButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(56, 189, 248, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.25)',
    width: '100%',
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 10,
  },
  copyButtonActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  copyIcon: {
    marginRight: 8,
  },
  copyButtonText: {
    color: '#38BDF8',
    fontSize: 14,
    fontWeight: '600',
  },
  copyButtonTextActive: {
    color: '#10B981',
    fontWeight: '600',
  },
  retryButton: {
    marginTop: 14,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  retryButtonText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
  },
  footerNote: {
    marginTop: 24,
    color: '#64748B',
    fontSize: 12,
  },
});

export default UpdateRequiredScreen;
