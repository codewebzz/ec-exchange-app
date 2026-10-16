import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useDispatch } from 'react-redux';
import { usePermissions } from '../hooks/usePermissions';
import { fetchUserPermissions } from '../redux/reducers/permissionsSlice';

interface PermissionGuardProps {
    /** Single permission value required to view children */
    permission?: string;
    /** Multiple permission values (use with requireAll) */
    permissions?: string[];
    /** If true, ALL permissions must be present. Default: any one is enough */
    requireAll?: boolean;
    /** Rendered when user lacks access. Defaults to the built-in error view */
    fallback?: React.ReactNode;
    children: React.ReactNode;
}

/**
 * React Native equivalent of the web's PermissionGuard.
 * Wraps a screen or component and only renders children when the user has the required permission(s).
 */
export const PermissionGuard: React.FC<PermissionGuardProps> = ({
    permission,
    permissions,
    requireAll = false,
    fallback = null,
    children,
}) => {
    const { hasPermission, hasAnyPermission, hasAllPermissions, isLoading, error } = usePermissions();
    const dispatch = useDispatch();

    if (isLoading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="small" color="#4f46e5" />
            </View>
        );
    }

    const permissionsToCheck = permission ? [permission] : (permissions ?? []);

    if (permissionsToCheck.length === 0) {
        // No permission requirement — always render children
        return <>{children}</>;
    }

    const hasAccess = requireAll
        ? hasAllPermissions(permissionsToCheck)
        : hasAnyPermission(permissionsToCheck);

    if (!hasAccess) {
        // If an explicit fallback is provided, render it
        if (fallback !== null && fallback !== undefined) {
            return <>{fallback}</>;
        }
        // When no fallback is specified, default to null (hide component like web)
        return null;
    }

    return <>{children}</>;
};

const styles = StyleSheet.create({
    center: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8f9fa',
        padding: 24,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 32,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
        maxWidth: 320,
        width: '100%',
    },
    icon: {
        fontSize: 48,
        marginBottom: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1a1a2e',
        marginBottom: 10,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 13,
        color: '#6b7280',
        textAlign: 'center',
        lineHeight: 20,
    },
    retryButton: {
        marginTop: 20,
        paddingVertical: 10,
        paddingHorizontal: 28,
        borderRadius: 8,
        backgroundColor: '#4f46e5',
    },
    retryText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
});
