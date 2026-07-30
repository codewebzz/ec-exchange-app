export const PERMISSIONS = {
    // Dashboard Module
    DASHBOARD_SHIFT_VIEW: {
        value: "perm_dash01shift",
        dependsOn: undefined
    },
    DASHBOARD_RECENT_LEDGERS_VIEW: {
        value: "perm_dash02ledger",
        dependsOn: undefined
    },
    DASHBOARD_REDECLARE_TRANSACTIONS_VIEW: {
        value: "perm_dash03redec",
        dependsOn: undefined
    },

    // Master Module - Shift
    MASTER_SHIFT_VIEW: {
        value: "perm_0f1a2b3c4d",
        dependsOn: undefined
    },
    MASTER_SHIFT_ADD: {
        value: "perm_5e6f7a8b9c",
        dependsOn: "perm_0f1a2b3c4d"
    },
    MASTER_SHIFT_ACTION: {
        value: "perm_a1b2c3d4e5",
        dependsOn: "perm_0f1a2b3c4d"
    },

    // Master Module - Ledger
    MASTER_LEDGER_VIEW: {
        value: "perm_f0e1d2c3b4",
        dependsOn: undefined
    },
    MASTER_LEDGER_ADD: {
        value: "perm_9a8b7c6d5e",
        dependsOn: "perm_f0e1d2c3b4"
    },
    MASTER_LEDGER_ACTION: {
        value: "perm_1f2e3d4c5b",
        dependsOn: "perm_f0e1d2c3b4"
    },

    // Master Module - Staff
    MASTER_STAFF_VIEW: {
        value: "perm_2a3b4c5d6e",
        dependsOn: undefined
    },
    MASTER_STAFF_ADD: {
        value: "perm_b9c8d7e6f5",
        dependsOn: "perm_2a3b4c5d6e"
    },
    MASTER_STAFF_ACTION: {
        value: "perm_c1d2e3f4a5",
        dependsOn: "perm_2a3b4c5d6e"
    },

    // Master Module - Agents
    MASTER_AGENTS_VIEW: {
        value: "perm_d0e1f2a3b4",
        dependsOn: undefined
    },
    MASTER_AGENTS_ADD: {
        value: "perm_e5f6a7b8c9",
        dependsOn: "perm_d0e1f2a3b4"
    },
    MASTER_AGENTS_ACTION: {
        value: "perm_f1a2b3c4d5",
        dependsOn: "perm_d0e1f2a3b4"
    },

    // Organization Module - Company
    ORGANIZATION_COMPANY_VIEW: {
        value: "perm_0a9b8c7d6e",
        dependsOn: undefined
    },
    ORGANIZATION_COMPANY_ADD: {
        value: "perm_12345abcde",
        dependsOn: "perm_0a9b8c7d6e"
    },
    ORGANIZATION_COMPANY_EDIT: {
        value: "perm_edcba54321",
        dependsOn: "perm_0a9b8c7d6e"
    },

    // Organization Module - Roles & Permissions
    ORGANIZATION_PERMISSIONS_VIEW: {
        value: "perm_aabbccdd11",
        dependsOn: undefined
    },
    ORGANIZATION_PERMISSIONS_ADD: {
        value: "perm_22ee55ff66",
        dependsOn: "perm_aabbccdd11"
    },

    // Transactions Module - Transaction
    TRANSACTIONS_TRANSACTION_VIEW: {
        value: "perm_1122aabbcc",
        dependsOn: undefined
    },
    TRANSACTIONS_TRANSACTION_ADD: {
        value: "perm_3344bbccdd",
        dependsOn: "perm_1122aabbcc"
    },
    TRANSACTIONS_TRANSACTION_EDIT: {
        value: "perm_5566ccddee",
        dependsOn: "perm_1122aabbcc"
    },
    TRANSACTIONS_DECLARE_TRANSACTION_EDIT: {
        value: "perm_5566ccddeeg",
        dependsOn: "perm_1122aabbcc"
    },
    TRANSACTIONS_TRANSACTION_COPY: {
        value: "perm_99aabbccdd",
        dependsOn: "perm_1122aabbcc"
    },
    TRANSACTIONS_TRANSACTION_JANTRI_VIEW: {
        value: "perm_bbddccaa11",
        dependsOn: "perm_1122aabbcc"
    },
    TRANSACTIONS_TRANSACTION_MAIN_JANTRI: {
        value: "perm_ddeeff0011",
        dependsOn: "perm_1122aabbcc"
    },

    // Transactions Module - Declare Transaction
    TRANSACTIONS_DECLARE_VIEW: {
        value: "perm_aa11bb22cc",
        dependsOn: undefined
    },
    TRANSACTIONS_DECLARE_DELETE: {
        value: "perm_bb22cc33dd",
        dependsOn: "perm_aa11bb22cc"
    },
    TRANSACTIONS_DECLARE_COPY: {
        value: "perm_cc33dd44ee",
        dependsOn: "perm_aa11bb22cc"
    },
    TRANSACTIONS_DECLARE_TRANSACTION_ADD: {
        value: "perm_5566cfdcddee",
        dependsOn: "perm_aa11bb22cc"
    },
    TRANSACTIONS_TRANSACTION_DELETE: {
        value: "perm_7788ddeeff",
        dependsOn: "perm_aa11bb22cc"
    },
    TRANSACTIONS_DECLARE_JANTRI_VIEW: {
        value: "perm_dd44ee55ff",
        dependsOn: "perm_aa11bb22cc"
    },
    TRANSACTIONS_DECLARE_MAIN_JANTRI: {
        value: "perm_ee55ff66aa",
        dependsOn: "perm_aa11bb22cc"
    },

    // Voucher Module - Journal Voucher
    VOUCHER_JOURNAL_VIEW: {
        value: "perm_fa01b2c3d4",
        dependsOn: undefined
    },
    VOUCHER_JOURNAL_ADD: {
        value: "perm_b1c2d3e4f5",
        dependsOn: "perm_fa01b2c3d4"
    },
    VOUCHER_JOURNAL_EDIT: {
        value: "perm_c2d3e4f5a6",
        dependsOn: "perm_fa01b2c3d4"
    },
    VOUCHER_JOURNAL_DELETE: {
        value: "perm_d3e4f5a6b7",
        dependsOn: "perm_fa01b2c3d4"
    },

    // Voucher Module - Limit Voucher
    VOUCHER_LIMIT_VIEW: {
        value: "perm_e4f5a6b7c8",
        dependsOn: undefined
    },
    VOUCHER_LIMIT_ADD: {
        value: "perm_f5a6b7c8d9",
        dependsOn: "perm_e4f5a6b7c8"
    },
    VOUCHER_LIMIT_EDIT: {
        value: "perm_a6b7c8d9e0",
        dependsOn: "perm_e4f5a6b7c8"
    },
    VOUCHER_LIMIT_DELETE: {
        value: "perm_b7c8d9e0f1",
        dependsOn: "perm_e4f5a6b7c8"
    },

    // Voucher Module - Vapsi Voucher
    VOUCHER_VAPSI_VIEW: {
        value: "perm_c8d9e0f1a2",
        dependsOn: undefined
    },
    VOUCHER_VAPSI_ADD: {
        value: "perm_d9e0f1a2b3",
        dependsOn: "perm_c8d9e0f1a2"
    },
    VOUCHER_VAPSI_EDIT: {
        value: "perm_e0f1a2b3c4",
        dependsOn: "perm_c8d9e0f1a2"
    },
    VOUCHER_VAPSI_DELETE: {
        value: "perm_f1a2b3c4d6",
        dependsOn: "perm_c8d9e0f1a2"
    },

    // Reports Module - Daily Report
    REPORTS_DAILY_VIEW: {
        value: "perm_rpt01a2b3c",
        dependsOn: undefined
    },

    // Reports Module - All Shift Report
    REPORTS_SHIFT_VIEW: {
        value: "perm_rpt02b3c4d",
        dependsOn: undefined
    },

    // Reports Module - Settling Report
    REPORTS_SETTLING_VIEW: {
        value: "perm_rpt03c4d5e",
        dependsOn: undefined
    },

    // Reports Module - Limit Balance Report
    REPORTS_LIMIT_BALANCE_VIEW: {
        value: "perm_rpt04d5e6f",
        dependsOn: undefined
    },

    // Reports Module - Profit Loss Report
    REPORTS_PROFIT_LOSS_VIEW: {
        value: "perm_rpt05e6f7a",
        dependsOn: undefined
    },

    // Reports Module - TPC Report 
    REPORTS_TPC_VIEW: {
        value: "perm_rpt06f7a8b",
        dependsOn: undefined
    },

    // Result Module - Live Prediction
    RESULT_LIVE_PREDICTION_VIEW: {
        value: "perm_res01a2b3",
        dependsOn: undefined
    },

    // Result Module - Live Prediction Actions
    RESULT_LIVE_PREDICTION_DECLARE: {
        value: "perm_res02b3c4",
        dependsOn: "perm_res01a2b3"
    },
    RESULT_LIVE_PREDICTION_REDECLARE: {
        value: "perm_res03c4d5",
        dependsOn: "perm_res01a2b3"
    },
    RESULT_LIVE_PREDICTION_UNDECLARE: {
        value: "perm_res04d5e6",
        dependsOn: "perm_res01a2b3"
    },

    // Result Module - Collection
    RESULT_COLLECTION_VIEW: {
        value: "perm_res05e6f7",
        dependsOn: undefined
    },

    // Result Module - Jantri
    RESULT_JANTRI_VIEW: {
        value: "perm_res06f7a8",
        dependsOn: undefined
    },

    // Master Module - Generate Link
    MASTER_GENERATE_LINK_VIEW: {
        value: "perm_res07a8b9",
        dependsOn: undefined
    },
    MASTER_GENERATE_LINK_ADD: {
        value: "perm_res08b9c0",
        dependsOn: "perm_res07a8b9"
    },
    MASTER_GENERATE_LINK_ACTION: {
        value: "perm_res09c0d1",
        dependsOn: "perm_res07a8b9"
    }
} as const;

export type PermissionKey = keyof typeof PERMISSIONS;
export type PermissionValue = typeof PERMISSIONS[PermissionKey]['value'];
