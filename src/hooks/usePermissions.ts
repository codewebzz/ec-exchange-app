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

    const hasPermission = (permission: PermissionValue): boolean => {
        return userPermissions.includes(permission);
    };

    const hasAnyPermission = (permissions: PermissionValue[]): boolean => {
        return permissions.some(p => userPermissions.includes(p));
    };

    const hasAllPermissions = (permissions: PermissionValue[]): boolean => {
        return permissions.every(p => userPermissions.includes(p));
    };

    return {
        userPermissions,
        isLoading,
        error,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
    };
};
