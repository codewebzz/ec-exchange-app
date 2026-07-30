import React, { useMemo, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
} from "react-native";
import { scale } from "react-native-size-matters";
import Icon from "react-native-vector-icons/MaterialIcons";
import { PERMISSIONS } from "../helper/permissions";
import { COLORS } from "../assets/colors";

// Define the permission structure
interface Permission {
    id: string;
    name: string;
    checked?: boolean;
    dependsOn?: string;
}

interface Submodule {
    name: string;
    permissions: Permission[];
}

interface Module {
    name: string;
    submodules: Submodule[];
    icon: string;
    color: string;
}

type Props = {
    selectedPermissions: string[];
    onPermissionsChange: (permissions: string[]) => void;
};

const Checkbox = ({ checked, onPress, disabled, label }: any) => (
    <TouchableOpacity
        style={[styles.checkboxContainer, disabled && styles.checkboxDisabled]}
        onPress={onPress}
        disabled={disabled}
    >
        <Icon
            name={checked ? "check-box" : "check-box-outline-blank"}
            size={scale(20)}
            color={disabled ? "#ccc" : checked ? COLORS.SUCCESSGREEN : "#666"}
        />
        <Text style={[styles.checkboxLabel, disabled && styles.textDisabled]}>
            {label}
            {disabled && <Text style={styles.smallText}> (requires View)</Text>}
            {!disabled && !label.includes("(View)") && (
                <Text style={styles.viewText}> (View)</Text>
            )}
        </Text>
    </TouchableOpacity>
);

export const PermissionsSelector: React.FC<Props> = ({ selectedPermissions, onPermissionsChange }) => {
    const modules = useMemo<Module[]>(() => [
        {
            name: "Dashboard",
            icon: "dashboard",
            color: "#3F51B5",
            submodules: [
                {
                    name: "Shift Cards",
                    permissions: [
                        { id: PERMISSIONS.DASHBOARD_SHIFT_VIEW.value, name: "View" },
                    ]
                },
                {
                    name: "Recent Ledgers",
                    permissions: [
                        { id: PERMISSIONS.DASHBOARD_RECENT_LEDGERS_VIEW.value, name: "View" },
                    ]
                },
                {
                    name: "Redeclare Transactions",
                    permissions: [
                        { id: PERMISSIONS.DASHBOARD_REDECLARE_TRANSACTIONS_VIEW.value, name: "View" },
                    ]
                }
            ]
        },
        {
            name: "Organization",
            icon: "settings",
            color: "#2196F3",
            submodules: [
                {
                    name: "Company",
                    permissions: [
                        { id: PERMISSIONS.ORGANIZATION_COMPANY_VIEW.value, name: "View" },
                        { id: PERMISSIONS.ORGANIZATION_COMPANY_ADD.value, name: "Add", dependsOn: PERMISSIONS.ORGANIZATION_COMPANY_VIEW.value },
                        { id: PERMISSIONS.ORGANIZATION_COMPANY_EDIT.value, name: "Edit", dependsOn: PERMISSIONS.ORGANIZATION_COMPANY_VIEW.value },
                    ]
                },
                {
                    name: "Roles & Permissions",
                    permissions: [
                        { id: PERMISSIONS.ORGANIZATION_PERMISSIONS_VIEW.value, name: "View" },
                        { id: PERMISSIONS.ORGANIZATION_PERMISSIONS_ADD.value, name: "Add", dependsOn: PERMISSIONS.ORGANIZATION_PERMISSIONS_VIEW.value },
                    ]
                },
            ]
        },
        {
            name: "Master",
            icon: "settings",
            color: "#2196F3",
            submodules: [
                {
                    name: "Shift",
                    permissions: [
                        { id: PERMISSIONS.MASTER_SHIFT_VIEW.value, name: "View" },
                        { id: PERMISSIONS.MASTER_SHIFT_ADD.value, name: "Add", dependsOn: PERMISSIONS.MASTER_SHIFT_VIEW.value },
                        { id: PERMISSIONS.MASTER_SHIFT_ACTION.value, name: "Action", dependsOn: PERMISSIONS.MASTER_SHIFT_VIEW.value },
                    ]
                },
                {
                    name: "Ledger",
                    permissions: [
                        { id: PERMISSIONS.MASTER_LEDGER_VIEW.value, name: "View" },
                        { id: PERMISSIONS.MASTER_LEDGER_ADD.value, name: "Add", dependsOn: PERMISSIONS.MASTER_LEDGER_VIEW.value },
                        { id: PERMISSIONS.MASTER_LEDGER_ACTION.value, name: "Action", dependsOn: PERMISSIONS.MASTER_LEDGER_VIEW.value },
                    ]
                },
                {
                    name: "Staff",
                    permissions: [
                        { id: PERMISSIONS.MASTER_STAFF_VIEW.value, name: "View" },
                        { id: PERMISSIONS.MASTER_STAFF_ADD.value, name: "Add", dependsOn: PERMISSIONS.MASTER_STAFF_VIEW.value },
                        { id: PERMISSIONS.MASTER_STAFF_ACTION.value, name: "Action", dependsOn: PERMISSIONS.MASTER_STAFF_VIEW.value },
                    ]
                },
                {
                    name: "Agents",
                    permissions: [
                        { id: PERMISSIONS.MASTER_AGENTS_VIEW.value, name: "View" },
                        { id: PERMISSIONS.MASTER_AGENTS_ADD.value, name: "Add", dependsOn: PERMISSIONS.MASTER_AGENTS_VIEW.value },
                        { id: PERMISSIONS.MASTER_AGENTS_ACTION.value, name: "Action", dependsOn: PERMISSIONS.MASTER_AGENTS_VIEW.value },
                    ]
                },
                {
                    name: "Generate Link",
                    permissions: [
                        { id: PERMISSIONS.MASTER_GENERATE_LINK_VIEW.value, name: "View" },
                        { id: PERMISSIONS.MASTER_GENERATE_LINK_ADD.value, name: "Add", dependsOn: PERMISSIONS.MASTER_GENERATE_LINK_VIEW.value },
                        { id: PERMISSIONS.MASTER_GENERATE_LINK_ACTION.value, name: "Action", dependsOn: PERMISSIONS.MASTER_GENERATE_LINK_VIEW.value },
                    ]
                }
            ]
        },
        {
            name: "Transactions",
            icon: "description",
            color: "#4CAF50",
            submodules: [
                {
                    name: "Transaction",
                    permissions: [
                        { id: PERMISSIONS.TRANSACTIONS_TRANSACTION_VIEW.value, name: "View" },
                        { id: PERMISSIONS.TRANSACTIONS_TRANSACTION_ADD.value, name: "Add", dependsOn: PERMISSIONS.TRANSACTIONS_TRANSACTION_VIEW.value },
                        { id: PERMISSIONS.TRANSACTIONS_TRANSACTION_EDIT.value, name: "Edit", dependsOn: PERMISSIONS.TRANSACTIONS_TRANSACTION_VIEW.value },
                        { id: PERMISSIONS.TRANSACTIONS_TRANSACTION_DELETE.value, name: "Delete", dependsOn: PERMISSIONS.TRANSACTIONS_TRANSACTION_VIEW.value },
                        { id: PERMISSIONS.TRANSACTIONS_TRANSACTION_COPY.value, name: "Copy", dependsOn: PERMISSIONS.TRANSACTIONS_TRANSACTION_VIEW.value },
                        { id: PERMISSIONS.TRANSACTIONS_TRANSACTION_JANTRI_VIEW.value, name: "Jantri View", dependsOn: PERMISSIONS.TRANSACTIONS_TRANSACTION_VIEW.value },
                    ]
                },
                {
                    name: "Declare Transaction",
                    permissions: [
                        { id: PERMISSIONS.TRANSACTIONS_DECLARE_VIEW.value, name: "View" },
                        { id: PERMISSIONS.TRANSACTIONS_DECLARE_COPY.value, name: "Copy", dependsOn: PERMISSIONS.TRANSACTIONS_DECLARE_VIEW.value },
                        { id: PERMISSIONS.TRANSACTIONS_DECLARE_DELETE.value, name: "Delete", dependsOn: PERMISSIONS.TRANSACTIONS_DECLARE_VIEW.value },
                        { id: PERMISSIONS.TRANSACTIONS_DECLARE_TRANSACTION_ADD.value, name: "Declare Add", dependsOn: PERMISSIONS.TRANSACTIONS_DECLARE_VIEW.value },
                        { id: PERMISSIONS.TRANSACTIONS_DECLARE_TRANSACTION_EDIT.value, name: "Declare Edit", dependsOn: PERMISSIONS.TRANSACTIONS_DECLARE_VIEW.value },
                        { id: PERMISSIONS.TRANSACTIONS_DECLARE_JANTRI_VIEW.value, name: "Jantri View", dependsOn: PERMISSIONS.TRANSACTIONS_DECLARE_VIEW.value },
                    ]
                }
            ]
        },
        {
            name: "Voucher",
            icon: "security",
            color: "#9C27B0",
            submodules: [
                {
                    name: "Journal Voucher",
                    permissions: [
                        { id: PERMISSIONS.VOUCHER_JOURNAL_VIEW.value, name: "View" },
                        { id: PERMISSIONS.VOUCHER_JOURNAL_ADD.value, name: "Add", dependsOn: PERMISSIONS.VOUCHER_JOURNAL_VIEW.value },
                        { id: PERMISSIONS.VOUCHER_JOURNAL_EDIT.value, name: "Edit", dependsOn: PERMISSIONS.VOUCHER_JOURNAL_VIEW.value },
                        { id: PERMISSIONS.VOUCHER_JOURNAL_DELETE.value, name: "Delete", dependsOn: PERMISSIONS.VOUCHER_JOURNAL_VIEW.value },
                    ]
                },
                {
                    name: "Limit Voucher",
                    permissions: [
                        { id: PERMISSIONS.VOUCHER_LIMIT_VIEW.value, name: "View" },
                        { id: PERMISSIONS.VOUCHER_LIMIT_ADD.value, name: "Add", dependsOn: PERMISSIONS.VOUCHER_LIMIT_VIEW.value },
                        { id: PERMISSIONS.VOUCHER_LIMIT_EDIT.value, name: "Edit", dependsOn: PERMISSIONS.VOUCHER_LIMIT_VIEW.value },
                        { id: PERMISSIONS.VOUCHER_LIMIT_DELETE.value, name: "Delete", dependsOn: PERMISSIONS.VOUCHER_LIMIT_VIEW.value },
                    ]
                },
                {
                    name: "Vapsi Voucher",
                    permissions: [
                        { id: PERMISSIONS.VOUCHER_VAPSI_VIEW.value, name: "View" },
                        { id: PERMISSIONS.VOUCHER_VAPSI_ADD.value, name: "Add", dependsOn: PERMISSIONS.VOUCHER_VAPSI_VIEW.value },
                        { id: PERMISSIONS.VOUCHER_VAPSI_EDIT.value, name: "Edit", dependsOn: PERMISSIONS.VOUCHER_VAPSI_VIEW.value },
                        { id: PERMISSIONS.VOUCHER_VAPSI_DELETE.value, name: "Delete", dependsOn: PERMISSIONS.VOUCHER_VAPSI_VIEW.value },
                    ]
                }
            ]
        },
        {
            name: "Result",
            icon: "trending-up",
            color: "#4CAF50",
            submodules: [
                {
                    name: "Live Prediction",
                    permissions: [
                        { id: PERMISSIONS.RESULT_LIVE_PREDICTION_VIEW.value, name: "View" },
                        { id: PERMISSIONS.RESULT_LIVE_PREDICTION_DECLARE.value, name: "Declare", dependsOn: PERMISSIONS.RESULT_LIVE_PREDICTION_VIEW.value },
                        { id: PERMISSIONS.RESULT_LIVE_PREDICTION_REDECLARE.value, name: "Redeclare", dependsOn: PERMISSIONS.RESULT_LIVE_PREDICTION_VIEW.value },
                        { id: PERMISSIONS.RESULT_LIVE_PREDICTION_UNDECLARE.value, name: "Undeclare", dependsOn: PERMISSIONS.RESULT_LIVE_PREDICTION_VIEW.value },
                    ]
                },
                {
                    name: "Collection",
                    permissions: [
                        { id: PERMISSIONS.RESULT_COLLECTION_VIEW.value, name: "View" },
                    ]
                },
                {
                    name: "Jantri",
                    permissions: [
                        { id: PERMISSIONS.RESULT_JANTRI_VIEW.value, name: "View" },
                    ]
                }
            ]
        },
        {
            name: "Reports",
            icon: "assessment",
            color: "#FF9800",
            submodules: [
                {
                    name: "Daily Report",
                    permissions: [
                        { id: PERMISSIONS.REPORTS_DAILY_VIEW.value, name: "View" },
                    ]
                },
                {
                    name: "All Shift Report",
                    permissions: [
                        { id: PERMISSIONS.REPORTS_SHIFT_VIEW.value, name: "View" },
                    ]
                },
                {
                    name: "Settling Report",
                    permissions: [
                        { id: PERMISSIONS.REPORTS_SETTLING_VIEW.value, name: "View" },
                    ]
                },
                {
                    name: "Limit Balance Report",
                    permissions: [
                        { id: PERMISSIONS.REPORTS_LIMIT_BALANCE_VIEW.value, name: "View" },
                    ]
                },
                {
                    name: "Profit Loss Report",
                    permissions: [
                        { id: PERMISSIONS.REPORTS_PROFIT_LOSS_VIEW.value, name: "View" },
                    ]
                },
                {
                    name: "TPC Report",
                    permissions: [
                        { id: PERMISSIONS.REPORTS_TPC_VIEW.value, name: "View" },
                    ]
                },
            ]
        }
    ], []);

    const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

    const isPermissionDisabled = (permission: Permission): boolean => {
        if (!permission.dependsOn) return false;
        return !selectedPermissions.includes(permission.dependsOn);
    };

    const handlePermissionChange = (permissionId: string, checked: boolean) => {
        let newPermissions: string[];

        if (checked) {
            newPermissions = [...selectedPermissions, permissionId];

            // Automatically check dependent permissions when parent is checked
            const dependents: string[] = [];
            modules.forEach(module => {
                module.submodules.forEach(submodule => {
                    submodule.permissions.forEach(permission => {
                        if (permission.dependsOn === permissionId) {
                            dependents.push(permission.id);
                        }
                    });
                });
            });

            if (dependents.length > 0) {
                newPermissions = [...new Set([...newPermissions, ...dependents])];
            }
        } else {
            newPermissions = selectedPermissions.filter(id => id !== permissionId);

            // When unchecking, remove all its dependent permissions
            const dependentPermissions: string[] = [];
            modules.forEach(module => {
                module.submodules.forEach(submodule => {
                    submodule.permissions.forEach(permission => {
                        if (permission.dependsOn === permissionId) {
                            dependentPermissions.push(permission.id);
                        }
                    });
                });
            });

            newPermissions = newPermissions.filter(id => !dependentPermissions.includes(id));
        }

        onPermissionsChange(newPermissions);
    };

    const toggleModule = (moduleName: string) => {
        const newExpanded = new Set(expandedModules);
        if (newExpanded.has(moduleName)) {
            newExpanded.delete(moduleName);
        } else {
            newExpanded.add(moduleName);
        }
        setExpandedModules(newExpanded);
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Icon name="security" size={scale(20)} color="#2196F3" />
                <Text style={styles.headerTitle}>Permissions</Text>
            </View>

            <View style={styles.modulesContainer}>
                {modules.map((module) => (
                    <View key={module.name} style={styles.moduleWrapper}>
                        <TouchableOpacity
                            style={[styles.moduleHeader, { borderColor: module.color + '40', backgroundColor: module.color + '10' }]}
                            onPress={() => toggleModule(module.name)}
                        >
                            <View style={styles.moduleTitleRow}>
                                <Icon name={module.icon} size={scale(20)} color={module.color} />
                                <Text style={styles.moduleTitle}>{module.name}</Text>
                            </View>
                            <Icon
                                name={expandedModules.has(module.name) ? "keyboard-arrow-down" : "keyboard-arrow-right"}
                                size={scale(20)}
                                color={module.color}
                            />
                        </TouchableOpacity>

                        {expandedModules.has(module.name) && (
                            <View style={styles.submodulesContainer}>
                                {module.submodules.map((submodule) => (
                                    <View key={submodule.name} style={styles.submoduleWrapper}>
                                        <View style={[styles.submoduleHeader, { borderLeftColor: module.color }]}>
                                            <Text style={styles.submoduleTitle}>{submodule.name}</Text>
                                        </View>
                                        <View style={styles.permissionsGrid}>
                                            {submodule.permissions.map((permission) => {
                                                const isChecked = selectedPermissions?.includes(permission.id) || false;
                                                const isDisabled = isPermissionDisabled(permission);
                                                return (
                                                    <Checkbox
                                                        key={permission.id}
                                                        label={permission.name}
                                                        checked={isChecked}
                                                        disabled={isDisabled}
                                                        onPress={() => handlePermissionChange(permission.id, !isChecked)}
                                                    />
                                                );
                                            })}
                                        </View>
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: scale(20),
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: scale(10),
        gap: scale(8),
    },
    headerTitle: {
        fontSize: scale(14),
        fontWeight: '700',
        color: '#1a237e',
    },
    modulesContainer: {
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: scale(12),
        backgroundColor: '#fff',
        padding: scale(12),
    },
    moduleWrapper: {
        marginBottom: scale(8),
    },
    moduleHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: scale(10),
        borderRadius: scale(8),
        borderWidth: 1,
    },
    moduleTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(10),
    },
    moduleTitle: {
        fontSize: scale(13),
        fontWeight: '600',
        color: '#333',
    },
    submodulesContainer: {
        paddingLeft: scale(15),
        marginTop: scale(5),
    },
    submoduleWrapper: {
        marginBottom: scale(10),
    },
    submoduleHeader: {
        borderLeftWidth: 3,
        paddingLeft: scale(8),
        marginBottom: scale(8),
        backgroundColor: '#f5f5f5',
        paddingVertical: scale(4),
        borderTopRightRadius: scale(4),
        borderBottomRightRadius: scale(4),
    },
    submoduleTitle: {
        fontSize: scale(12),
        fontWeight: '500',
        color: '#444',
    },
    permissionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingLeft: scale(10),
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '50%',
        paddingVertical: scale(5),
    },
    checkboxDisabled: {
        opacity: 0.6,
    },
    checkboxLabel: {
        fontSize: scale(11),
        color: '#444',
        marginLeft: scale(5),
    },
    textDisabled: {
        color: '#999',
    },
    smallText: {
        fontSize: scale(9),
        color: '#999',
    },
    viewText: {
        fontSize: scale(9),
        color: '#2196F3',
    }
});
