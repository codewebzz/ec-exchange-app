import { useCallback } from 'react';
import { useSelector } from 'react-redux';

type PermissionValue = string;

/**
 * Hook that provides permission-checking utilities.
 * Reads from the Redux permissions store (mirrors the web's usePermissionStore).
 */
export const usePermissions = () => {
    const userPermissions: PermissionValue[] = useSelector(
        (state: any) => state?.permissions?.userPermissions ?? []
    );
    const isLoading: boolean = useSelector(
        (state: any) => state?.permissions?.isLoading ?? false
    );
    const error: string | null = useSelector(
        (state: any) => state?.permissions?.error ?? null
    );

    const hasPermission = useCallback((permission: PermissionValue): boolean => {
        return userPermissions.includes(permission);
    }, [userPermissions]);

    const hasAnyPermission = useCallback((permissions: PermissionValue[]): boolean => {
        return permissions.some(p => userPermissions.includes(p));
    }, [userPermissions]);

    const hasAllPermissions = useCallback((permissions: PermissionValue[]): boolean => {
        return permissions.every(p => userPermissions.includes(p));
    }, [userPermissions]);

    return {
        userPermissions,
        isLoading,
        error,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
    };
};
