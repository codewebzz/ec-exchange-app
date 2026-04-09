import AxiosService from './AxiosService';

const version = 'ver=1.0';
export interface CommonResponse {
  success?: boolean;
  refresh_token: string;
  user?: any;
  message: string;
}
interface ToggleUserResponse {
  success: boolean;
  message: string;
}
const APIService = {
  VerifyOTP: (data: any) =>
    AxiosService.post(`signup/verifyotp?${version}`, {
      ownermobile: data.ownermobile,
      ownerEmail: data.owneremail,
      otp: data.otp,
      otpemail: data.otpemail,
      sessionid: data.sessionid,
    }),
  LoginUser: (data: any): Promise<CommonResponse> =>
    AxiosService.post<CommonResponse>(
      'api/login',
      {
        grant_type: 'password',
        username: data.username,
        password: data.password,
        client_id: 'string',
        client_secret: 'string',
      },
      {},
      true, // Enable form-urlencoded encoding
    ),

  CreateShift: (data: any): Promise<CommonResponse> =>
    AxiosService.post<CommonResponse>(`api/create_shift`, {
      shift_name: data?.shift_name,
      open_date: data?.open_date,
      next_day: data?.next_day,
      shift_mode: data?.shift_mode,
      super_admin_update_time: data?.super_admin_update_time,
      cash_agent_update_time: data?.cash_agent_update_time,
      data_entry_operator_update_time: data?.data_entry_operator_update_time,
      owner_update_time: data?.owner_update_time,
      fanter_update_time: data?.fanter_update_time,
      admin_update_time: data?.admin_update_time,
    }),
  GetShift: async (params?: object): Promise<any> => {
    try {
      const res = await AxiosService.get('api/get_shifts', params);
      return res; // ✅ Make sure you're returning this
    } catch (err: any) {
      console.log('GetShift Error:', err?.response?.data || err.message);
      throw err;
    }
  },
  UpdateShift: (data: any, shift_id?: number): Promise<any> => 
    AxiosService.patch<CommonResponse>(`api/update_shift/${shift_id}`, {
      shift_name: data?.shift_name,
      open_date: data?.open_date,
      next_day: data?.next_day,
      shift_mode: data?.shift_mode,
      super_admin_update_time: data?.super_admin_update_time,
      cash_agent_update_time: data?.cash_agent_update_time,
      data_entry_operator_update_time: data?.data_entry_operator_update_time,
      owner_update_time: data?.owner_update_time,
      fanter_update_time: data?.fanter_update_time,
      admin_update_time: data?.admin_update_time,
      open_time: data?.open_time,
    }),
  ToggleShiftActive: (id: number) =>
    AxiosService.put<ToggleUserResponse>(`api/activate_shift/${id}`),

  ToggleShiftDeActive: (id: number) =>
    AxiosService.put<ToggleUserResponse>(`api/deactivate_shift/${id}`),
  
  
  CreateStaff: (data: any): Promise<CommonResponse> =>
    AxiosService.post<CommonResponse>(`api/create_staff`, {
      staff_name: data?.staff_name || '',
      staff_role: data?.staff_role || '',
      agent_id: data?.agent_id || 0,
      password: data?.password || '',
      mobile: data?.mobile || '',
      address: data?.address || '',
      username: data?.username || '',
      work_mode: data?.work_mode || '',
    }),
  GetStaff: async (params?: object): Promise<any> => {
    try {
      const res = await AxiosService.get('api/get_all_staff', params);
      return res;
    } catch (err: any) {
      console.log('GetStaff Error:', err?.response?.data || err.message);
      throw err;
    }
  },
  UpdateStaff: (data: any, staff_id?: number): Promise<CommonResponse> =>
    AxiosService.patch<CommonResponse>(`api/update_staff/${staff_id}`, {
      // staff_name: data?.staff_name || '',
      staff_role: data?.staff_role || '',
      agent_id: data?.agent_id || 0,
      password: data?.password || '',
      mobile: data?.mobile || '',
      address: data?.address || '',
      // username: data?.username || '',
      work_mode: data?.work_mode || '',
    }),
  ToggleStaffActive: (id: number) =>
    AxiosService.put<ToggleUserResponse>(`api/activate_staff/${id}`),

  ToggleStaffDeActive: (id: number) =>
    AxiosService.put<ToggleUserResponse>(`api/deactivate_staff/${id}`),
  CreateAgent: (data: any): Promise<CommonResponse> =>
    AxiosService.post<CommonResponse>(`api/create_agent`, {
      agent_name: data?.agent_name || '',
      username: data?.username || '',
      parent_agent_id: data?.parent_agent_id || 0,
      main_agent_id: data?.main_agent_id || '',
      password: data?.password || '',
    }),
  GetAgent: async (params?: object): Promise<any> => {
    try {
      const res = await AxiosService.get('api/get_all_agents', params);
      return res;
    } catch (err: any) {
      console.log('GetStaff Error:', err?.response?.data || err.message);
      throw err;
    }
  },
  UpdateAgent: (data: any, agent_id?: number): Promise<CommonResponse> =>
    AxiosService.patch<CommonResponse>(`api/update_agent/${agent_id}`, {
      agent_name: data?.agent_name || '',
      username: data?.username || '',
      parent_agent_id: data?.parent_agent_id || 0,
      main_agent_id: data?.main_agent_id || 0,
      password: data?.password || '',
    }),
  ToggleAgentActive: (id: number) =>
    AxiosService.put<ToggleUserResponse>(`api/activate_agent/${id}`),

  ToggleAgentDeActive: (id: number) =>
    AxiosService.put<ToggleUserResponse>(`api/deactivate_agent/${id}`),

  GetDailyReport: async (params?: object): Promise<any> => {
    try {
      const res = await AxiosService.get('api/daily_report', params);
      return res;
    } catch (err: any) {
      console.log('GetDailyReport Error:', err?.response?.data || err.message);
      throw err;
    }
  },
  GetAllShiftReport: async (params?: object): Promise<any> => {
    try {
      const res = await AxiosService.get('api/all_shift_report', params);
      return res;
    } catch (err: any) {
      console.log(
        'GetAllShiftReport Error:',
        err?.response?.data || err.message,
      );
      throw err;
    }
  },
  GetSettlingReport: async (params?: object): Promise<any> => {
    try {
      const res = await AxiosService.get('api/settling_report', params);
      return res;
    } catch (err: any) {
      console.log(
        'GetSettlingReport Error:',
        err?.response?.data || err.message,
      );
      throw err;
    }
  },
  GetProfitLossReport: async (params?: object): Promise<any> => {
    try {
      const res = await AxiosService.get('api/profit_lose_report', params);
      return res;
    } catch (err: any) {
      console.log(
        'GetProfitLossReport Error:',
        err?.response?.data || err.message,
      );
      throw err;
    }
  },
  GetLimitBalanceReport: async (params?: object): Promise<any> => {
    try {
      const res = await AxiosService.get('api/limit_balance_report', params);
      return res;
    } catch (err: any) {
      console.log('GetLimitBalanceReport Error:', err?.response?.data || err.message);
      throw err;
    }
  },
  getTCPReport: async (params?: object): Promise<any> => {
    try {
      const res = await AxiosService.get('api/get_tpc_report', params);
      return res;
    } catch (err: any) {
      console.log('GetTCPReport Error:', err?.response?.data || err.message);
      throw err;
    }
  },
  CreateCompany: (data: any): Promise<CommonResponse> =>
    AxiosService.post<CommonResponse>(`api/create_company`, {
      company_name: data?.company_name,
      print_name: data?.print_name,
      short_name: data?.short_name,
      country: data?.country,
      state: data?.state,
      address: data?.address,
      pincode: data?.pincode,
      pan: data?.pan,
      mobile: data?.mobile,
      mail: data?.mail,
      username: data?.username,
      password: data?.password,
    }),
  GetCompany: async (params?: object): Promise<any> => {
    try {
      const res = await AxiosService.get('api/list_company', params);
      return res;
    } catch (err: any) {
      console.log('GetStaff Error:', err?.response?.data || err.message);
      throw err;
    }
  },
  UpdateCompany: (data: any, company_id?: number): Promise<CommonResponse> =>
    AxiosService.patch<CommonResponse>(`api/update_company/${company_id}`, {
      company_name: data?.company_name,
      print_name: data?.print_name,
      short_name: data?.short_name,
      country: data?.country,
      state: data?.state,
      address: data?.address,
      pincode: data?.pincode,
      pan: data?.pan,
      mobile: data?.mobile,
      mail: data?.mail,
      username: data?.username,
      password: data?.password,
    }),
  ToggleCompanyActive: (id: number) =>
    AxiosService.put<ToggleUserResponse>(`api/activate_company/${id}`),

  ToggleCompanyDeActive: (id: number) =>
    AxiosService.put<ToggleUserResponse>(`api/deactivate_company/${id}`),
  CreateLeadger: (data: any): Promise<CommonResponse> =>
    AxiosService.post<CommonResponse>(`api/signup`, {
      real_name: data?.real_name,
      user_role: data?.user_role,
      mobile: data?.mobile,
      password: data?.password,
      address: data?.address,
      dhai_rate: data?.dhai_rate,
      dhai_rate_commission: data?.dhai_rate_commission,
      harup_rate: data?.harup_rate,
      harup_rate_commission: data?.harup_rate_commission,
      limit_vouters_id: data?.limit_vouters_id,
      distributer_user_id: data?.distributer_user_id,
      agent_user_id: data?.agent_user_id || 0,
      active_status: true,
      limit_type: data?.limit_type || "",
      hide_account: false,
      login_status: false,
      third_party_commission: data?.third_party_commission || [],
      wapsi: data?.wapsi,
      wapsi_data: data?.wapsi_data || [],
      patti: data?.patti || [],
    }),
  GetLeadger: async (params?: object): Promise<any> => {
    try {
      const res = await AxiosService.get('api/get_all_users', params);
      return res;
    } catch (err: any) {
      console.log('GetStaff Error:', err?.response?.data || err.message);
      throw err;
    }
  },
  
  UpdateLedger: (data: any, user_id?: number): Promise<CommonResponse> =>
    // Forward only provided fields; do not inject defaults here.
    AxiosService.patch<CommonResponse>(`api/update_user/${user_id}`, data),

  createJornalVoucher: (data: any): Promise<CommonResponse> =>
    AxiosService.post<CommonResponse>(`api/create_journal_voucher`, {
      user_id: data?.user_id || 0,
      opposite_user_id: data?.opposite_user_id || "",
      lena_dena: data?.lena_dena || 1,
      amount: data?.amount || 1,
      remark: data?.remark || "",
      date: data?.date || ""
    }),
  GetJornalVoucher: async (params?: object): Promise<any> => {
    try {
      const res = await AxiosService.get('api/get_all_journal_voucher', params);
      return res;
    } catch (err: any) {
      console.log('GetJornalVoucher Error:', err?.response?.data || err.message);
      throw err;
    }
  },
  UpdateJornalVoucher: (data: any, voucher_id?: number): Promise<CommonResponse> =>
    AxiosService.patch<CommonResponse>(`api/update_journal_voucher/${voucher_id}`, {
      user_id: data?.user_id || 0,
      opposite_user_id: data?.opposite_user_id || "",
      lena_dena: data?.lena_dena || 1,
      amount: data?.amount || 1,
      remark: data?.remark || "",
      date: data?.date || ""
    }),
  DeleteJornalVoucher: (voucher_id: number): Promise<CommonResponse> =>
    AxiosService.delete<CommonResponse>(`api/delete_journal_voucher?voucher=${voucher_id}`),

  createVapsiVoucher: (data: any): Promise<CommonResponse> =>
    AxiosService.post<CommonResponse>(`api/create_vapsi_voucher`, {
      user_id: data?.user_id || 0,
      opposite_user_id: data?.opposite_user_id || "",
      lena_dena: data?.lena_dena || 1,
      amount: data?.amount || 1,
      remark: data?.remark || "",
      date: data?.date || ""
    }),
  GetVapsiVoucher: async (params?: object): Promise<any> => {
    try {
      const res = await AxiosService.get('api/get_all_vapsi_voucher', params);
      return res;
    } catch (err: any) {
      console.log('GetJornalVoucher Error:', err?.response?.data || err.message);
      throw err;
    }
  },
  UpdateVapsiVoucher: (data: any, voucher_id?: number): Promise<CommonResponse> =>
    AxiosService.patch<CommonResponse>(`api/update_vapsi_voucher/${voucher_id}`, {
      user_id: data?.user_id || 0,
      opposite_user_id: data?.opposite_user_id || "",
      lena_dena: data?.lena_dena || 1,
      amount: data?.amount || 1,
      remark: data?.remark || "",
      date: data?.date || ""
    }),
  
  DeleteVapsiVoucher: (voucher_id: number): Promise<CommonResponse> =>
    
    AxiosService.delete<CommonResponse>(`api/delete_vapsi_voucher?voucher=${voucher_id}`),

  createLimitVoucher: (data: any): Promise<CommonResponse> =>
    AxiosService.post<CommonResponse>(`api/create_limit_voucher`, {
      user_id: data?.user_id || 0,
      opposite_user_id: data?.opposite_user_id || "",
      lena_dena: data?.lena_dena || 1,
      amount: data?.amount || 1,
      remark: data?.remark || "",
      date: data?.date || ""
    }),
  GetLimitVoucher: async (params?: object): Promise<any> => {
    try {
      const res = await AxiosService.get('api/get_all_limit_voucher', params);
      return res;
    } catch (err: any) {
      console.log('GetLimitVoucher Error:', err?.response?.data || err.message);
      throw err;
    }
  },
  UpdateLimitVoucher: (data: any, voucher_id?: number): Promise<CommonResponse> =>
    AxiosService.patch<CommonResponse>(`api/update_limit_voucher/${voucher_id}`, {
      user_id: data?.user_id || 0,
      opposite_user_id: data?.opposite_user_id || "",
      lena_dena: data?.lena_dena || 1,
      amount: data?.amount || 1,
      remark: data?.remark || "",
      date: data?.date || ""
    }),
  DeleteLimitVoucher: (voucher_id: number): Promise<CommonResponse> =>
    AxiosService.delete<CommonResponse>(`api/delete_limit_voucher?voucher=${voucher_id}`),
  GetTransaction: async (params?: object): Promise<any> => {
    try {
      const res = await AxiosService.get('api/get_transaction', params);
      return res;
    } catch (err: any) {
      console.log('GetLimitVoucher Error:', err?.response?.data || err.message);
      throw err;
    }
  },
  GetDecelearedTransaction: async (params?: object): Promise<any> => {
    try {
      const res = await AxiosService.get('api/master/get_declared_transactions', params);
      return res;
    } catch (err: any) {
      console.log('GetLimitVoucher Error:', err?.response?.data || err.message);
      throw err;
    }
  },

  GetTransactionData: async (params?: object, transaction_id?: number): Promise<any> => {
    try {
      const res = await AxiosService.get(`api/get_transaction_data/${transaction_id}`);
      return res;
    } catch (err: any) {
      console.log('GetLimitVoucher Error:', err?.response?.data || err.message);
      throw err;
    }
  },
  createTransaction: (data: any): Promise<CommonResponse> =>
    AxiosService.post<CommonResponse>(`api/create_transaction`, {
      shift_id: data?.shift_id || 0,
      ledger_id: data?.ledger_id || 0,
      mode: data?.mode || 1,
      limit: data?.limit || 0,
      capping: data?.capping || 0,
      data_entry_mode: "C",
      is_active: true,
      transaction_data: data?.transaction_data || []
    }),
    DeleteTransaction: (data: any): Promise<CommonResponse> =>
      AxiosService.delete<CommonResponse>(`api/delete_transaction?transaction_id=${data?.transaction_id}`),
      CopyTransactionData: async (copy_id?: any, copy_into_id?: any): Promise<any> => {
        try {
          const res = await AxiosService.patch(`api/copy_transaction/${copy_id}/${copy_into_id}`);
          return res;
        } catch (err: any) {
          console.log('CopyTransactionData Error:', err?.response?.data || err.message);
          throw err;
        }
      },
      UpdateTransactionData: async (transaction_id: any, data: any): Promise<any> => {
        try {
          const res = await AxiosService.patch(`/api/update_transaction/${transaction_id}`, data);
          return res;
        } catch (err: any) {
          console.log('UpdateTransactionData Error:', err?.response?.data || err.message);
          throw err;
        }
      },
      GetShiftDropDownDataData: async (params?: object, transaction_id?: number): Promise<any> => {
        try {
          const res = await AxiosService.get(`api/master/get_shift_id_name`);
          return res;
        } catch (err: any) {
          console.log('GetLimitVoucher Error:', err?.response?.data || err.message);
          throw err;
        }
      },
      GetStaffDropDownDataData: async (params?: object, transaction_id?: number): Promise<any> => {
        try {
          const res = await AxiosService.get(`api/master/get_all_staff_name_id`);
          return res;
        } catch (err: any) {
          console.log('GetLimitVoucher Error:', err?.response?.data || err.message);
          throw err;
        }
      },
      GetAgentDropDownDataData: async (params?: object, transaction_id?: number): Promise<any> => {
        try {
          const res = await AxiosService.get(`api/master/get_all_agents_name_id`);
          return res;
        } catch (err: any) {
          console.log('GetLimitVoucher Error:', err?.response?.data || err.message);
          throw err;
        }
      },
      GetLedgerDropDownDataData: async (params?: object, transaction_id?: number): Promise<any> => {
        try {
          const res = await AxiosService.get(`api/master/get_all_ledger_names`);
          return res;
        } catch (err: any) {
          console.log('GetLimitVoucher Error:', err?.response?.data || err.message);
          throw err;
        }
      },
      GetDistributorDropDownDataData: async (params?: object, transaction_id?: number): Promise<any> => {
        try {
          const res = await AxiosService.get(`api/master/ledger_distributer`);
          return res;
        } catch (err: any) {
          console.log('GetLimitVoucher Error:', err?.response?.data || err.message);
          throw err;
        }
      },
      GetUndeclearedDropDownData: async (params?: object, transaction_id?: number): Promise<any> => {
        try {
          const res = await AxiosService.get(`api/get_active_open_and_undeclared_shifts`);
          return res;
        } catch (err: any) {
          console.log('GetLimitVoucher Error:', err?.response?.data || err.message);
          throw err;
        }
      },
      LockLeadger: (user_id: number) =>
        AxiosService.put<ToggleUserResponse>(`api/lock_user/${user_id}`),
      UnlockLeadger: (user_id: number) =>
        AxiosService.put<ToggleUserResponse>(`api/unlock_user/${user_id}`),
     HideLeadger: (user_id: number) =>
        AxiosService.put<ToggleUserResponse>(`api/hide_user/${user_id}`),
      UnHideLeadger: (user_id: number) =>
        AxiosService.put<ToggleUserResponse>(`api/unhide_user/${user_id}`),
      DeleteLeadger: (user_id: number) =>
        AxiosService.put<ToggleUserResponse>(`api/delete_user/${user_id}`),
      RestoreLeadger: (user_id: number) =>
        AxiosService.put<ToggleUserResponse>(`api/restore_user/${user_id}`),
      ToggleUserActive: (user_id: number) =>
        AxiosService.put<ToggleUserResponse>(`api/activate_user/${user_id}`),
    
      ToggleUserDeActive: (user_id: number) =>
        AxiosService.put<ToggleUserResponse>(`api/deactivate_user/${user_id}`),
      GetDeletedTransaction: async (params?: object): Promise<any> => {
        try {
          const res = await AxiosService.get(`api/get_deleted_transaction`, params);
          return res;
        } catch (err: any) {
          console.log('GetLimitVoucher Error:', err?.response?.data || err.message);
          throw err;
        }
      },

      //Result 
      collectionResult: (data: any): Promise<CommonResponse> =>
        AxiosService.post<CommonResponse>(`api/get_collection`, {
          shift_id:data?.shift_id,
          cut_commission: data?.cut_commission || 0,
          cut_patti: data?.cut_patti || 0,
          cut_wapsi: data?.cut_wapsi || 0,
          mix_akh: data?.mix_akh || 0,
          less_amt: data?.less_amt || 0,
          less_percentage: data?.less_percentage || 0,
          round_off_value: data?.round_off_value || 0,
        date:data?.date
        }),
        liveResultByNumber: (data: any,number:any): Promise<CommonResponse> =>
        AxiosService.post<CommonResponse>(`api/get_live_prediction/${number}`),
        LiveResult: (data: any,number:any): Promise<CommonResponse> =>  AxiosService.post<CommonResponse>(`api/get_live_prediction`,{
          shift_id:data?.shift_id,
          date:data?.date
        }),
        roleDropDownAPI: async (params?: object, transaction_id?: number): Promise<any> => {
          try {
            const res = await AxiosService.get(`api/master/supported_staff_roles`);
            return res;
          } catch (err: any) {
            console.log('GetLimitVoucher Error:', err?.response?.data || err.message);
            throw err;
          }
        },
        agentRoleAPI: async (params?: object, transaction_id?: number): Promise<any> => {
          try {
            const res = await AxiosService.get(`api/master/get_all_staff_name_id`);
            return res;
          } catch (err: any) {
            console.log('GetLimitVoucher Error:', err?.response?.data || err.message);
            throw err;
          }
        },
        getMasterLedgerAgent: async (params?: object, transaction_id?: number): Promise<any> => {
          try {
            const res = await AxiosService.get(`api/master/ledger_agents`);
            return res;
          } catch (err: any) {
            console.log('GetLimitVoucher Error:', err?.response?.data || err.message);
            throw err;
          }
        },

        UpdatePermissionData: async (data: any): Promise<any> => {
          try {
            const res = await AxiosService.put(`/api/update_permission`, data);
            return res;
          } catch (err: any) {
            console.log('UpdateTransactionData Error:', err?.response?.data || err.message);
            throw err;
          }
        },
        getPassword: async (params?: object, userName?: any): Promise<any> => {
          try {
            const res = await AxiosService.get(`api/get_user_password/${userName}`);
            return res;
          } catch (err: any) {
            console.log('GetPassword Error:', err?.response?.data || err.message);
            throw err;
          }
        },
        getRecentUser: async (params?: object): Promise<any> => {
          try {
            const res = await AxiosService.get(`api/get_recent_users`);
            return res;
          } catch (err: any) {
            console.log('GetRecentUser Error:', err?.response?.data || err.message);
            throw err;
          }
        },
        getDashboardShiftData: async (params?: object): Promise<any> => {
          try {
            const res = await AxiosService.get(`api/get_dashboard_shift_data`);
            return res;
          } catch (err: any) {
            console.log('GetDashboardShiftData Error:', err?.response?.data || err.message);
            throw err;
          }
        },
        getallundeclaredtransactionsbydateshift: async (params?: object): Promise<any> => {
          try {
            const res = await AxiosService.get(`api/get_all_undeclared_transactions_by_date_shift`);
            return res;
          } catch (err: any) {
            console.log('GetAllUndeclaredTransactionsByDateShift Error:', err?.response?.data || err.message);
            throw err;
          }
        },
        GetShiftById: async (shift_id: any): Promise<any> => {
          try {
            const res = await AxiosService.get(`api/get_shift/${shift_id}`);
            return res;
          } catch (err: any) {
            console.log('GetShiftById Error:', err?.response?.data || err.message);
            throw err;
          }
        },
        GetLedgerTransactionModes: async (ledger_id: any): Promise<any> => {
          try {
            const res = await AxiosService.get(`api/master/ledger_transaction_mode/${ledger_id}`);
            return res;
          } catch (err: any) {
            console.log('GetLedgerTransactionModes Error:', err?.response?.data || err.message);
            throw err;
          }
        },
};

export default APIService;