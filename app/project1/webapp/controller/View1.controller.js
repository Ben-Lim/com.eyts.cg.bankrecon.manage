sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Sorter"
], function (Controller, Fragment, JSONModel, MessageToast, MessageBox, Filter, FilterOperator, Sorter) {
    "use strict";

    return Controller.extend("project1.controller.View1", {


        onInit: function () {
            // Create model with mock data
            var oData = {
                // NEW: Date filter properties
                filterDateFrom: this._getFormattedDate(-7), // 7 days ago
                filterDateTo: this._getFormattedDate(0), // today
                selectedDateRange: "week",
                autoRefresh: false,
                lastSyncTime: new Date().toLocaleTimeString(),

                // ADD LINES FOR FLAG DIALOG:
                reviewers: [
                    { name: "Sarah Mitchell" },
                    { name: "James Chen" },
                    { name: "Maria Rodriguez" },
                    { name: "David Thompson" }
                ],
                selectedReviewer: "",
                flagComment: "",
                flagCharCount: 0,

                // Mock data for transactions
                transactions: [
                    {
                        transDate: "2026-01-22",
                        transDate: "2026-01-22",
                        store: "SWITCH @ SUNWAY PYRAMID",
                        transactionId: "123456789",
                        merchantId: "1250103504",
                        paymentMethod: "Credit Card",
                        grossAmount: "12458.89",
                        mdrRate: "3.24%",
                        discAmount: "-10.01",
                        nettAmount: "12448.88",
                        settlement: "12053.41",
                        variance: "N/A",
                        status: "Matched"
                    },
                    {
                        transDate: "2026-01-22",
                        store: "SWITCH @ WANGSA WALK MALL",
                        transactionId: "234567890",
                        merchantId: "1250103652",
                        paymentMethod: "Debit Card",
                        grossAmount: "25319.16",
                        mdrRate: "3.23%",
                        discAmount: "-5.01",
                        nettAmount: "25314.15",
                        settlement: "24502.22",
                        variance: "N/A",
                        status: "Matched"
                    },
                    {
                        transDate: "2026-01-22",
                        store: "UR BY SWITCH @ KUALA SELA",
                        transactionId: "290192922",
                        merchantId: "1250105988",
                        paymentMethod: "E-Wallet",
                        grossAmount: "163.43",
                        mdrRate: "3.24%",
                        discAmount: "-3.01",
                        nettAmount: "160.42",
                        settlement: "158.13",
                        variance: "4.99",
                        status: "Unmatched"
                    },
                    {
                        transDate: "2026-01-21",
                        store: "URBAN REPUBLIC @ KL EAST",
                        transactionId: "299186384",
                        merchantId: "1250104882",
                        paymentMethod: "E-Wallet",
                        grossAmount: "4764.44",
                        mdrRate: "3.23%",
                        discAmount: "-2.01",
                        nettAmount: "4762.43",
                        settlement: "4610.78",
                        variance: "9.99",
                        status: "Unmatched"
                    },
                    {
                        transDate: "2026-01-21",
                        store: "UR BY SWITCH @ PLAZA KLTS",
                        transactionId: "172839112",
                        merchantId: "1250104734",
                        paymentMethod: "Credit Card",
                        grossAmount: "00.00",
                        mdrRate: "0.00%",
                        discAmount: "0.00",
                        nettAmount: "00.00",
                        settlement: "1282.49",
                        variance: "N/A",
                        status: "Pending POS"
                    },
                    {
                        transDate: "2026-01-20",
                        store: "URBAN REPUBLIC @ PAVILION",
                        transactionId: "288094632",
                        merchantId: "1250104833",
                        paymentMethod: "Credit Card",
                        grossAmount: "2453.78",
                        mdrRate: "3.24%",
                        discAmount: "-8.01",
                        nettAmount: "2445.77",
                        settlement: "00.00",
                        variance: "N/A",
                        status: "Pending Stmt"
                    }
                ],


                // Current filter for reconciliation data
                currentFilter: "all",


                // Mock data for recent activity
                recentActivity: [
                    {
                        action: "Reconciliation Completed - Batch #1247",
                        timestamp: "2 hours ago",
                        icon: "sap-icon://accept"
                    },
                    {
                        action: "23 Discrepancies Identified",
                        timestamp: "3 hours ago",
                        icon: "sap-icon://alert"
                    },
                    {
                        action: "POS Settlement Matched - 45,230",
                        timestamp: "5 hours ago",
                        icon: "sap-icon://payment-approval"
                    },
                    {
                        action: "Manual Review Required - Transaction #8834",
                        timestamp: "Yesterday at 4:32 PM",
                        icon: "sap-icon://warning"
                    },
                    {
                        action: "Merchant Settlement Processed",
                        timestamp: "Yesterday at 2:15 PM",
                        icon: "sap-icon://money-bills"
                    },
                    {
                        action: "Rules Engine Updated",
                        timestamp: "Yesterday at 11:20 AM",
                        icon: "sap-icon://edit"
                    },
                    {
                        action: "Batch Processing Started - 1,834 transactions",
                        timestamp: "2 days ago",
                        icon: "sap-icon://play"
                    },
                    {
                        action: "Exception Report Generated",
                        timestamp: "2 days ago",
                        icon: "sap-icon://document"
                    }
                ],


                // Mock data for rules
                rules: [
                    {
                        id: "rule1",
                        ruleName: "Auto-Match Low Variance",
                        description: "Automatically match transactions with variance below threshold",
                        conditions: "Variance ≤ 1% AND Variance < 5",
                        enabled: true,
                        selected: false
                    },
                    {
                        id: "rule2",
                        ruleName: "Fee Adjustment Match",
                        description: "Match when difference equals payment processor fees",
                        conditions: "Settlement date within 3 days AND Variance = Fees",
                        enabled: true,
                        selected: false
                    },
                    {
                        id: "rule3",
                        ruleName: "Flag High Variance",
                        description: "Flag transactions with high variance for manual review",
                        conditions: "Variance > 100 OR Variance > 5%",
                        enabled: true,
                        selected: false
                    },
                    {
                        id: "rule4",
                        ruleName: "Same Day Settlement",
                        description: "Auto-match when settlement occurs on same day as transaction",
                        conditions: "Transaction date = Settlement date AND Variance = 0",
                        enabled: false,
                        selected: false
                    },
                    {
                        id: "rule5",
                        ruleName: "Bulk Transaction Match",
                        description: "Match multiple transactions that sum to settlement amount",
                        conditions: "Sum of transactions = Settlement amount",
                        enabled: false,
                        selected: false
                    }
                ],


                // Counter for selected rules
                selectedRulesCount: 0
            };


            // Set the model to the view
            var oModel = new JSONModel(oData);
            this.getView().setModel(oModel);


            // NEW: Initial data load
            this.loadDashboardData();

        },

        // ListReportFragment OnClick handler
        OnClickHandler: function () {

            var ExcepRpt = [{
                MerchantID: "1250103504",
                MerchantName: "SWITCH @ SUNWAY PYRAMID",
                TransactionID: "123456789",
                Type: "Cashbill",
                RefNo: "WISS0076002",
                SKU: "SKU1234",
                Product: "12345",
                Location: "SS",
                SalesDate: "2025-01-08",
                Status: "COMMITTED",
                Info: "Others",
                PaymentMethod: "RHBDUITNOW",
                Quantity: "1",
                GrossSales: "1",
                Discount: "1",
                NetAmount: "432.48",
                EDCTerminalNo: "64529819",
                SettlementDate: "2025-08-17",
                EDCBatchNo: "225",
                SettlementBatchNo: "82079",
                CardNoTransID: "4364-34xx-xxxx-5841",
                TransDate: "2025-08-17",
                TransTime: "11:19:32",
                ApprovalCode: "923621",
                TransAmount: "434",
                MDRRate: "0.35",
                DiscAmount: "-1.52",
                NettAmount: "432.48",
                CardBrand: "Visa Prepaid",
                InterchangeFeeCode: "PR",
                RPPID: "1",
                InstitutionName: "1",
                AccountType: "1",
                Name: "Switch",
                MerchantTransactionID: "123456",
            }, {
                MerchantID: "1250103504",
                MerchantName: "SWITCH @ SUNWAY PYRAMID",
                TransactionID: "12414125",
                Type: "Cashbill",
                RefNo: "WISS0076002",
                SKU: "SKU32345",
                Product: "32345",
                Location: "SS",
                SalesDate: "2025-01-08",
                Status: "COMMITTED",
                Info: "O2480767374",
                PaymentMethod: "Loyalty Redemption",
                Quantity: "1",
                GrossSales: "1",
                Discount: "1",
                NetAmount: "432.48",
                EDCTerminalNo: "64529819",
                SettlementDate: "2025-08-17",
                EDCBatchNo: "225",
                SettlementBatchNo: "82079",
                CardNoTransID: "4363-45xx-xxxx-1725",
                TransDate: "2025-08-17",
                TransTime: "13:22:45",
                ApprovalCode: "41656",
                TransAmount: "344",
                MDRRate: "0.7",
                DiscAmount: "-2.41",
                NettAmount: "341.59",
                CardBrand: "Visa Credit",
                InterchangeFeeCode: "CR",
                RPPID: "2",
                InstitutionName: "2",
                AccountType: "2",
                Name: "Switch",
                MerchantTransactionID: "123141",
            }, {
                MerchantID: "1250103504",
                MerchantName: "SWITCH @ SUNWAY PYRAMID",
                TransactionID: "89172945",
                Type: "Cashbill",
                RefNo: "WISS0076002",
                SKU: "SKU1241567",
                Product: "1241567",
                Location: "SS",
                SalesDate: "2025-01-08",
                Status: "COMMITTED",
                Info: "Others",
                PaymentMethod: "RHBDUITNOW",
                Quantity: "1",
                GrossSales: "1",
                Discount: "1",
                NetAmount: "432.48",
                EDCTerminalNo: "64529819",
                SettlementDate: "2025-08-17",
                EDCBatchNo: "225",
                SettlementBatchNo: "82079",
                CardNoTransID: "4966-23xx-xxxx-6184",
                TransDate: "2025-08-17",
                TransTime: "13:32:15",
                ApprovalCode: "923621",
                TransAmount: "434",
                MDRRate: "0.7",
                DiscAmount: "-3.14",
                NettAmount: "445.86",
                CardBrand: "Visa Credit",
                InterchangeFeeCode: "CR",
                RPPID: "3",
                InstitutionName: "3",
                AccountType: "3",
                Name: "Switch",
                MerchantTransactionID: "334145",
            }, {
                MerchantID: "1250103504",
                MerchantName: "SWITCH @ SUNWAY PYRAMID",
                TransactionID: "123456789",
                Type: "Cashbill",
                RefNo: "WISS0076002",
                SKU: "SKU1234",
                Product: "12345",
                Location: "SS",
                SalesDate: "2025-01-08",
                Status: "COMMITTED",
                Info: "Others",
                PaymentMethod: "RHBDUITNOW",
                Quantity: "1",
                GrossSales: "1",
                Discount: "1",
                NetAmount: "432.48",
                EDCTerminalNo: "64529819",
                SettlementDate: "2025-08-17",
                EDCBatchNo: "225",
                SettlementBatchNo: "82079",
                CardNoTransID: "4364-34xx-xxxx-5841",
                TransDate: "2025-08-17",
                TransTime: "11:19:32",
                ApprovalCode: "923621",
                TransAmount: "434",
                MDRRate: "0.35",
                DiscAmount: "-1.52",
                NettAmount: "432.48",
                CardBrand: "Visa Prepaid",
                InterchangeFeeCode: "PR",
                RPPID: "1",
                InstitutionName: "1",
                AccountType: "1",
                Name: "Switch",
                MerchantTransactionID: "123456",
            }, 
        ];

            var oModel = new JSONModel();
            oModel.setData({ listitem: ExcepRpt });
            this.getView().setModel(oModel, "exceprpt");

            if (!this.customDialog) {
                Fragment.load({
                    name: "project1.ext.Card.List",
                    controller: this
                }).then(function (customDialog) {
                    this.customDialog = customDialog;
                    this.customDialog.setModel(this.getView().getModel("exceprpt"));
                    this.getView().addDependent(this.customDialog);
                    this.customDialog.open();
                }.bind(this));
            }
        },
        onCloseDialog: function () {
            if (this.customDialog) {
                this.customDialog.close();
            }
        },

        // ==================== NEW: DATE FILTER FUNCTIONS ====================

        _getFormattedDate: function (daysOffset) {
            var date = new Date();
            date.setDate(date.getDate() + daysOffset);
            return date.toISOString().split('T')[0];
        },

        onQuickDateFilter: function (oEvent) {
            var sKey = oEvent.getParameter("item").getKey();
            var oModel = this.getView().getModel();
            var fromDate, toDate;

            switch (sKey) {
                case "today":
                    fromDate = this._getFormattedDate(0);
                    toDate = this._getFormattedDate(0);
                    break;
                case "week":
                    fromDate = this._getFormattedDate(-7);
                    toDate = this._getFormattedDate(0);
                    break;
                case "month":
                    fromDate = this._getFormattedDate(-30);
                    toDate = this._getFormattedDate(0);
                    break;
                case "custom":
                    // Keep current dates
                    return;
            }


            oModel.setProperty("/filterDateFrom", fromDate);
            oModel.setProperty("/filterDateTo", toDate);


            this.loadDashboardData();
            this.applyDateFilterToReconciliation(); // NEW: Apply to reconciliation tab
        },

        onDateChange: function () {
            var oModel = this.getView().getModel();
            oModel.setProperty("/selectedDateRange", "custom");
            this.loadDashboardData();
            this.applyDateFilterToReconciliation(); // NEW: Apply to reconciliation tab
        },

        onRefreshData: function () {
            sap.ui.core.BusyIndicator.show(0);
            this.loadDashboardData();
            this.applyDateFilterToReconciliation(); // NEW: Apply to reconciliation tab
        },

        onAutoRefreshToggle: function (oEvent) {
            var bState = oEvent.getParameter("state");


            if (bState) {
                // Start auto-refresh every 2 minutes
                this._autoRefreshInterval = setInterval(() => {
                    this.loadDashboardData();
                    this.applyDateFilterToReconciliation(); // NEW: Apply to reconciliation tab
                }, 120000); // 120000ms = 2 minutes


                MessageToast.show("Auto-refresh enabled (every 2 minutes)");
            } else {
                // Stop auto-refresh
                if (this._autoRefreshInterval) {
                    clearInterval(this._autoRefreshInterval);
                    this._autoRefreshInterval = null;
                }
                MessageToast.show("Auto-refresh disabled");
            }
        },

        // NEW: Apply date filter to reconciliation table
        applyDateFilterToReconciliation: function () {
            var oModel = this.getView().getModel();
            var sDateFrom = oModel.getProperty("/filterDateFrom");
            var sDateTo = oModel.getProperty("/filterDateTo");
            var sCurrentFilter = oModel.getProperty("/currentFilter");


            // Reapply the current filter with new date range
            this.filterReconciliationData(sCurrentFilter, sDateFrom, sDateTo);
        },

        loadDashboardData: function () {
            var oModel = this.getView().getModel();
            var sDateFrom = oModel.getProperty("/filterDateFrom");
            var sDateTo = oModel.getProperty("/filterDateTo");


            // Simulate API call with setTimeout
            setTimeout(() => {
                // Update last sync time
                oModel.setProperty("/lastSyncTime", new Date().toLocaleTimeString());

                // Here you would normally call your OData service or REST API
                // For now, we'll just show a success message
                sap.ui.core.BusyIndicator.hide();
                MessageToast.show("Dashboard data refreshed for " + sDateFrom + " to " + sDateTo);


                // Load recent activity
                this.loadRecentActivity();
            }, 1000);

            /* UNCOMMENT THIS WHEN HAVE A REAL ODATA SERVICE:
            
            var oDataModel = this.getOwnerComponent().getModel(); // your OData model
            
            // Build filters
            var aFilters = [
                new Filter("Date", FilterOperator.BT, sDateFrom, sDateTo)
            ];
            
            // Read dashboard metrics
            oDataModel.read("/DashboardMetrics", {
                filters: aFilters,
                success: function(oData) {
                    // Update model with live data
                    oModel.setProperty("/totalReconciliations", oData.results[0].TotalReconciliations);
                    oModel.setProperty("/matchedToday", oData.results[0].MatchedToday);
                    oModel.setProperty("/discrepancies", oData.results[0].Discrepancies);
                    oModel.setProperty("/totalAmount", oData.results[0].TotalAmount);
                    oModel.setProperty("/matchedAmount", oData.results[0].MatchedAmount);
                    oModel.setProperty("/unmatchedAmount", oData.results[0].UnmatchedAmount);
                    
                    // Update last sync time
                    oModel.setProperty("/lastSyncTime", new Date().toLocaleTimeString());
                    
                    sap.ui.core.BusyIndicator.hide();
                    MessageToast.show("Data refreshed successfully");
                }.bind(this),
                error: function(oError) {
                    sap.ui.core.BusyIndicator.hide();
                    MessageBox.error("Failed to load dashboard data");
                }
            });
            
            // Load recent activity
            this.loadRecentActivity(aFilters);
            */
        },

        loadRecentActivity: function (aFilters) {
            var oModel = this.getView().getModel();

            // Mock data - in real scenario, this would come from backend
            var aActivity = [
                {
                    action: "Reconciliation Completed - Batch #1247",
                    timestamp: "2 hours ago",
                    icon: "sap-icon://accept"
                },
                {
                    action: "23 Discrepancies Identified",
                    timestamp: "3 hours ago",
                    icon: "sap-icon://alert"
                },
                {
                    action: "POS Settlement Matched - 45,230",
                    timestamp: "5 hours ago",
                    icon: "sap-icon://payment-approval"
                },
                {
                    action: "Manual Review Required - Transaction #8834",
                    timestamp: "Yesterday at 4:32 PM",
                    icon: "sap-icon://warning"
                },
                {
                    action: "Merchant Settlement Processed",
                    timestamp: "Yesterday at 2:15 PM",
                    icon: "sap-icon://money-bills"
                },
                {
                    action: "Rules Engine Updated",
                    timestamp: "Yesterday at 11:20 AM",
                    icon: "sap-icon://edit"
                },
                {
                    action: "Batch Processing Started - 1,834 transactions",
                    timestamp: "2 days ago",
                    icon: "sap-icon://play"
                },
                {
                    action: "Exception Report Generated",
                    timestamp: "2 days ago",
                    icon: "sap-icon://document"
                },
                {
                    action: "Manual Review Required - Transaction #8834",
                    timestamp: "Yesterday at 4:32 PM",
                    icon: "sap-icon://warning"
                },
                {
                    action: "Merchant Settlement Processed",
                    timestamp: "Yesterday at 2:15 PM",
                    icon: "sap-icon://money-bills"
                },
                {
                    action: "Rules Engine Updated",
                    timestamp: "Yesterday at 11:20 AM",
                    icon: "sap-icon://edit"
                },
                {
                    action: "Batch Processing Started - 1,834 transactions",
                    timestamp: "2 days ago",
                    icon: "sap-icon://play"
                },
                {
                    action: "Exception Report Generated",
                    timestamp: "2 days ago",
                    icon: "sap-icon://document"
                }
            ];


            oModel.setProperty("/recentActivity", aActivity);

            /* UNCOMMENT THIS WHEN HAVE A REAL ODATA SERVICE:
            
            var oDataModel = this.getOwnerComponent().getModel();
            
            oDataModel.read("/RecentActivity", {
                filters: aFilters,
                sorters: [new Sorter("Timestamp", true)], // descending
                success: function(oData) {
                    var aActivity = oData.results.map(function(item) {
                        return {
                            action: item.Action,
                            timestamp: this._formatTimestamp(item.Timestamp),
                            icon: this._getActivityIcon(item.Type)
                        };
                    }.bind(this));
                    
                    oModel.setProperty("/recentActivity", aActivity);
                }.bind(this),
                error: function(oError) {
                    console.error("Failed to load recent activity");
                }
            });
            */
        },

        _formatTimestamp: function (sTimestamp) {
            var oDate = new Date(sTimestamp);
            var now = new Date();
            var diffMs = now - oDate;
            var diffMins = Math.floor(diffMs / 60000);
            var diffHours = Math.floor(diffMs / 3600000);
            var diffDays = Math.floor(diffMs / 86400000);


            if (diffMins < 60) {
                return diffMins + " minutes ago";
            } else if (diffHours < 24) {
                return diffHours + " hours ago";
            } else if (diffDays === 1) {
                return "Yesterday at " + oDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                return "Yesterday at " + oDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            } else if (diffDays < 7) {
                return diffDays + " days ago";
            } else {
                return oDate.toLocaleDateString() + " " + oDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                return oDate.toLocaleDateString() + " " + oDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            }
        },

        _getActivityIcon: function (sType) {
            var iconMap = {
                "COMPLETED": "sap-icon://accept",
                "DISCREPANCY": "sap-icon://alert",
                "MATCHED": "sap-icon://payment-approval",
                "REVIEW": "sap-icon://warning",
                "SETTLEMENT": "sap-icon://money-bills",
                "UPDATE": "sap-icon://edit",
                "PROCESSING": "sap-icon://play",
                "REPORT": "sap-icon://document"
            };
            return iconMap[sType] || "sap-icon://message-information";
        },

        onExit: function () {
            // Clean up auto-refresh interval
            if (this._autoRefreshInterval) {
                clearInterval(this._autoRefreshInterval);
            }
        },
        // ==================== TRANSACTION DETAILS WITH VIEW BUTTONS ====================

        onReviewTransaction: function (oEvent) {
            var oButton = oEvent.getSource();
            var oContext = oButton.getBindingContext();
            var oTransaction = oContext.getObject();

            // Create dialog if it doesn't exist
            if (!this._oTransactionDialog) {
                this._oTransactionDialog = sap.ui.xmlfragment(
                    "project1.view.TransactionDetails",
                    this
                );
                this.getView().addDependent(this._oTransactionDialog);
            }

            // Set the transaction data to a separate model property
            var oModel = this.getView().getModel();
            oModel.setProperty("/selectedTransaction", oTransaction);

            // Open the dialog
            this._oTransactionDialog.open();
        },
        onReviewTransaction: function (oEvent) {
            var oButton = oEvent.getSource();
            var oContext = oButton.getBindingContext();
            var oTransaction = oContext.getObject();

            // Create dialog if it doesn't exist
            if (!this._oTransactionDialog) {
                this._oTransactionDialog = sap.ui.xmlfragment(
                    "project1.view.TransactionDetails",
                    this
                );
                this.getView().addDependent(this._oTransactionDialog);
            }

            // Set the transaction data to a separate model property
            var oModel = this.getView().getModel();
            oModel.setProperty("/selectedTransaction", oTransaction);

            // Open the dialog
            this._oTransactionDialog.open();
        },

        onCloseTransactionDialog: function () {
            if (this._oTransactionDialog) {
                this._oTransactionDialog.close();
            }
        },
        onCloseTransactionDialog: function () {
            if (this._oTransactionDialog) {
                this._oTransactionDialog.close();
            }
        },

        onViewPOSTransaction: function () {
            var oModel = this.getView().getModel();
            var oTransaction = oModel.getProperty("/selectedTransaction");

            // CHECK STATUS FIRST - if Pending POS, show empty state
            if (oTransaction.status === "Pending POS") {
                // Set empty POS Transaction data
                oModel.setProperty("/POSTransactionList", []);

                // Create and open POS Transaction dialog with empty data
                if (!this._oPOSDialog) {
                    this._oPOSDialog = sap.ui.xmlfragment(
                        "project1.view.POSTransactionList",
                        this
                    );
                    this.getView().addDependent(this._oPOSDialog);
                }

                this._oPOSDialog.open();

                // Optionally show a message
                MessageToast.show("No POS Transaction data available for pending transactions");
                return; // Exit the function early
            }

            // EXISTING CODE - Only execute for non-Pending transactions


            // Mock POS transaction data
            var aPOSTransactions = [
                {
                    no: "1",
                    merchantName: oTransaction.store,
                    merchantId: oTransaction.merchantId,
                    edcTerminalNo: "64529819",
                    settlementDate: "45886",
                    edcBatchNo: "225",
                    statementBatchNo: "82079 4364-34xx-xxxx-5841",
                    cardNoTransId: "45886",
                    transDate: "17-Aug-25",
                    transTime: "0.471998148",
                    approvalCode: "923621",
                    transAmount: "434",
                    mdrRate: "0.35",
                    discAmount: "-1.52",
                    nettAmount: "432.48",
                    cardBrand: "Visa Prepaid",
                    interchangeFeeCode: "PR"
                },
                {
                    no: "2",
                    merchantName: oTransaction.store,
                    merchantId: oTransaction.merchantId,
                    edcTerminalNo: "64529819",
                    settlementDate: "45886",
                    edcBatchNo: "225",
                    statementBatchNo: "82079 4364-34xx-xxxx-1725",
                    cardNoTransId: "45656",
                    transDate: "17-Aug-25",
                    transTime: "0.557485278",
                    approvalCode: "41656",
                    transAmount: "344",
                    mdrRate: "0.7",
                    discAmount: "-2.41",
                    nettAmount: "341.59",
                    cardBrand: "Visa Credit",
                    interchangeFeeCode: "CR"
                },
                {
                    no: "3",
                    merchantName: oTransaction.store,
                    merchantId: oTransaction.merchantId,
                    edcTerminalNo: "64529819",
                    settlementDate: "45886",
                    edcBatchNo: "225",
                    statementBatchNo: "82079 4596-23xx-xxxx-6184",
                    cardNoTransId: "45886",
                    transDate: "17-Aug-25",
                    transTime: "0.5640625",
                    approvalCode: "3570",
                    transAmount: "449",
                    mdrRate: "0.7",
                    discAmount: "-3.14",
                    nettAmount: "445.86",
                    cardBrand: "Visa Credit",
                    interchangeFeeCode: "CR"
                },
                {
                    no: "4",
                    merchantName: oTransaction.store,
                    merchantId: oTransaction.merchantId,
                    edcTerminalNo: "64529819",
                    settlementDate: "45886",
                    edcBatchNo: "225",
                    statementBatchNo: "82079 4238-00xx-xxxx-7594",
                    cardNoTransId: "45886",
                    transDate: "17-Aug-25",
                    transTime: "0.638888889",
                    approvalCode: "504366",
                    transAmount: "229",
                    mdrRate: "2.5",
                    discAmount: "-5.73",
                    nettAmount: "223.27",
                    cardBrand: "Visa Credit",
                    interchangeFeeCode: "CR"
                }
            ];

            oModel.setProperty("/posTransactionsList", aPOSTransactions);

            // Create and open POS dialog
            if (!this._oPOSDialog) {
                this._oPOSDialog = sap.ui.xmlfragment(
                    "project1.view.POSTransactionList",
                    this
                );
                this.getView().addDependent(this._oPOSDialog);
            }

            this._oPOSDialog.open();
        },

        onViewMerchantStatement: function () {
            var oModel = this.getView().getModel();
            var oTransaction = oModel.getProperty("/selectedTransaction");

            // CHECK STATUS FIRST - if Pending Stmt, show empty state
            if (oTransaction.status === "Pending Stmt") {
                // Set empty merchant statement data
                oModel.setProperty("/merchantStatementsList", []);

                // Create and open Merchant Statement dialog with empty data
                if (!this._oMerchantDialog) {
                    this._oMerchantDialog = sap.ui.xmlfragment(
                        "project1.view.MerchantStatementList",
                        this
                    );
                    this.getView().addDependent(this._oMerchantDialog);
                }

                this._oMerchantDialog.open();

                // Optionally show a message
                MessageToast.show("No merchant statement data available for pending transactions");
                return; // Exit the function early
            }

            // EXISTING CODE - Only execute for non-Pending transactions
            // Mock merchant statement data from your Excel
            var aMerchantStatements = [
                {
                    no: "1",
                    merchantName: oTransaction.store,
                    merchantId: oTransaction.merchantId,
                    edcTerminalNo: "64529819",
                    settlementDate: "17-Aug-25",
                    edcBatchNo: "225",
                    statementBatchNo: "82079 4364-34xx-xxxx-5841",
                    cardNoTransId: "45886",
                    transDate: "17-Aug-25",
                    transTime: "0.471998148",
                    approvalCode: "923621",
                    transAmount: "434",
                    mdrRate: "0.35",
                    discAmount: "-1.52",
                    nettAmount: "432.48",
                    cardBrand: "Visa Prepaid",
                    interchangeFeeCode: "PR"
                },
                {
                    no: "2",
                    merchantName: oTransaction.store,
                    merchantId: oTransaction.merchantId,
                    edcTerminalNo: "64529819",
                    settlementDate: "17-Aug-25",
                    edcBatchNo: "225",
                    statementBatchNo: "82079 4364-34xx-xxxx-1725",
                    cardNoTransId: "45656",
                    transDate: "17-Aug-25",
                    transTime: "0.557485278",
                    approvalCode: "41656",
                    transAmount: "344",
                    mdrRate: "0.7",
                    discAmount: "-2.41",
                    nettAmount: "341.59",
                    cardBrand: "Visa Credit",
                    interchangeFeeCode: "CR"
                },
                {
                    no: "3",
                    merchantName: oTransaction.store,
                    merchantId: oTransaction.merchantId,
                    edcTerminalNo: "64529819",
                    settlementDate: "17-Aug-25",
                    edcBatchNo: "225",
                    statementBatchNo: "82079 4596-23xx-xxxx-6184",
                    cardNoTransId: "45886",
                    transDate: "17-Aug-25",
                    transTime: "0.5640625",
                    approvalCode: "3570",
                    transAmount: "449",
                    mdrRate: "0.7",
                    discAmount: "-3.14",
                    nettAmount: "445.86",
                    cardBrand: "Visa Credit",
                    interchangeFeeCode: "CR"
                },
                {
                    no: "4",
                    merchantName: oTransaction.store,
                    merchantId: oTransaction.merchantId,
                    edcTerminalNo: "64529819",
                    settlementDate: "17-Aug-25",
                    edcBatchNo: "225",
                    statementBatchNo: "82079 4238-00xx-xxxx-7594",
                    cardNoTransId: "45886",
                    transDate: "17-Aug-25",
                    transTime: "0.638888889",
                    approvalCode: "504366",
                    transAmount: "229",
                    mdrRate: "2.5",
                    discAmount: "-5.73",
                    nettAmount: "223.27",
                    cardBrand: "Visa Credit",
                    interchangeFeeCode: "CR"
                },
                {
                    no: "5",
                    merchantName: oTransaction.store,
                    merchantId: oTransaction.merchantId,
                    edcTerminalNo: "64529822",
                    settlementDate: "17-Aug-25",
                    edcBatchNo: "179",
                    statementBatchNo: "82081 5421-24xx-xxxx-9949",
                    cardNoTransId: "17-Aug-25",
                    transDate: "17-Aug-25",
                    transTime: "12:00:24",
                    approvalCode: "R45300",
                    transAmount: "2900.5",
                    mdrRate: "0.7",
                    discAmount: "-20.3",
                    nettAmount: "2880.2",
                    cardBrand: "Master Credit",
                    interchangeFeeCode: "CR"
                },
                {
                    no: "6",
                    merchantName: oTransaction.store,
                    merchantId: oTransaction.merchantId,
                    edcTerminalNo: "64529822",
                    settlementDate: "17-Aug-25",
                    edcBatchNo: "179",
                    statementBatchNo: "82081 5306-62xx-xxxx-7326",
                    cardNoTransId: "17-Aug-25",
                    transDate: "17-Aug-25",
                    transTime: "13:28:59",
                    approvalCode: "N2CPBC",
                    transAmount: "308",
                    mdrRate: "2.5",
                    discAmount: "-3.14",
                    nettAmount: "445.86",
                    cardBrand: "Visa Credit",
                    interchangeFeeCode: "CR"
                },
                {
                    no: "7",
                    merchantName: oTransaction.store,
                    merchantId: oTransaction.merchantId,
                    edcTerminalNo: "64529819",
                    settlementDate: "17-Aug-25",
                    edcBatchNo: "225",
                    statementBatchNo: "82079 4238-00xx-xxxx-7594",
                    cardNoTransId: "45886",
                    transDate: "17-Aug-25",
                    transTime: "0.638888889",
                    approvalCode: "504366",
                    transAmount: "229",
                    mdrRate: "2.5",
                    discAmount: "-5.73",
                    nettAmount: "223.27",
                    cardBrand: "Visa Credit",
                    interchangeFeeCode: "CR"
                },
                {
                    no: "8",
                    merchantName: oTransaction.store,
                    merchantId: oTransaction.merchantId,
                    edcTerminalNo: "64529822",
                    settlementDate: "17-Aug-25",
                    edcBatchNo: "179",
                    statementBatchNo: "82081 5421-24xx-xxxx-9949",
                    cardNoTransId: "17-Aug-25",
                    transDate: "17-Aug-25",
                    transTime: "12:00:24",
                    approvalCode: "R45300",
                    transAmount: "2900.5",
                    mdrRate: "0.7",
                    discAmount: "-20.3",
                    nettAmount: "2880.2",
                    cardBrand: "Master Credit",
                    interchangeFeeCode: "CR"
                },
                {
                    no: "9",
                    merchantName: oTransaction.store,
                    merchantId: oTransaction.merchantId,
                    edcTerminalNo: "64529822",
                    settlementDate: "17-Aug-25",
                    edcBatchNo: "179",
                    statementBatchNo: "82081 5306-62xx-xxxx-7326",
                    cardNoTransId: "17-Aug-25",
                    transDate: "17-Aug-25",
                    transTime: "13:28:59",
                    approvalCode: "N2CPBC",
                    transAmount: "308",
                    mdrRate: "2.5",
                    discAmount: "-7.7",
                    nettAmount: "300.3",
                    cardBrand: "Master Debit",
                    interchangeFeeCode: "DB"
                },
                {
                    no: "10",
                    merchantName: oTransaction.store,
                    merchantId: oTransaction.merchantId,
                    edcTerminalNo: "64529822",
                    settlementDate: "17-Aug-25",
                    edcBatchNo: "179",
                    statementBatchNo: "82081 5432-93xx-xxxx-9971",
                    cardNoTransId: "17-Aug-25",
                    transDate: "17-Aug-25",
                    transTime: "17:24:58",
                    approvalCode: "R244P2",
                    transAmount: "2348",
                    mdrRate: "0.7",
                    discAmount: "-16.44",
                    nettAmount: "2331.56",
                    cardBrand: "Master Credit",
                    interchangeFeeCode: "CR"
                }
            ];

            oModel.setProperty("/merchantStatementsList", aMerchantStatements);

            // Create and open Merchant Statement dialog
            if (!this._oMerchantDialog) {
                this._oMerchantDialog = sap.ui.xmlfragment(
                    "project1.view.MerchantStatementList",
                    this
                );
                this.getView().addDependent(this._oMerchantDialog);
            }

            this._oMerchantDialog.open();
        },

        onClosePOSDialog: function () {
            if (this._oPOSDialog) {
                this._oPOSDialog.close();
            }
        },
        onClosePOSDialog: function () {
            if (this._oPOSDialog) {
                this._oPOSDialog.close();
            }
        },

        onCloseMerchantDialog: function () {
            if (this._oMerchantDialog) {
                this._oMerchantDialog.close();
            }
        },
        onCloseMerchantDialog: function () {
            if (this._oMerchantDialog) {
                this._oMerchantDialog.close();
            }
        },


        onFlagForReview: function () {
            var oView = this.getView();
            var oModel = oView.getModel();

            // Reset flag dialog fields
            oModel.setProperty("/selectedReviewer", "");
            oModel.setProperty("/flagComment", "");
            oModel.setProperty("/flagCharCount", 0);

            // Create dialog if not exists
            if (!this._oFlagDialog) {
                Fragment.load({
                    id: oView.getId(),
                    name: "project1.view.FlagTransactionDialog",
                    controller: this
                }).then(function (oDialog) {
                    this._oFlagDialog = oDialog;
                    oView.addDependent(oDialog);
                    oDialog.open();
                }.bind(this));
            } else {
                this._oFlagDialog.open();
            }
        },

        onFlagCommentChange: function (oEvent) {
            var sComment = oEvent.getParameter("value");
            var oModel = this.getView().getModel();
            oModel.setProperty("/flagCharCount", sComment.length);
        },

        onSubmitFlag: function () {
            var oModel = this.getView().getModel();
            var sReviewer = oModel.getProperty("/selectedReviewer");
            var sComment = oModel.getProperty("/flagComment").trim();
            var oTransaction = oModel.getProperty("/selectedTransaction");

            // Validation
            if (!sReviewer) {
                MessageBox.error("Please select a reviewer");
                return;
            }

            if (!sComment) {
                MessageBox.error("Please enter a comment");
                return;
            }

            // Prepare flag data
            var oFlagData = {
                transactionId: oTransaction.transactionId,
                store: oTransaction.store,
                reviewer: sReviewer,
                comment: sComment,
                flaggedDate: new Date().toISOString(),
                flaggedBy: "Current User" // Replace with actual logged-in user
            };

            // Update transaction status
            var aTransactions = oModel.getProperty("/transactions");
            var iIndex = aTransactions.findIndex(t => t.transactionId === oTransaction.transactionId);

            if (iIndex !== -1) {
                aTransactions[iIndex].status = "Flagged for Review";
                oModel.setProperty("/transactions", aTransactions);
            }

            console.log("Transaction Flagged:", oFlagData);

            // Here you would call your backend service to save the flag
            // Example: this._saveFlagData(oFlagData);

            MessageToast.show("The workflow has been triggered for review by " + sReviewer);

            // Close both dialogs
            this._oFlagDialog.close();
            this.onCloseTransactionDialog();
        },

        onCancelFlag: function () {
            if (this._oFlagDialog) {
                this._oFlagDialog.close();
            }
        },

        // ==================== EXISTING: EVENT HANDLERS FOR RULES ENGINE ====================
        onAddRule: function () {
            MessageToast.show("Add New Rule clicked");
        },

        onEditRule: function (oEvent) {
            MessageToast.show("Edit Rule clicked");
        },

        onDeleteRule: function (oEvent) {
            MessageToast.show("Delete Rule clicked");
        },

        onTestRules: function () {
            MessageToast.show("Test Selected Rules clicked");
        },

        onDeleteSelectedRules: function () {
            var oTable = this.byId("rulesTable");
            var aSelectedItems = oTable.getSelectedItems();
            MessageToast.show("Delete " + aSelectedItems.length + " selected rules");
        },

        onTestSingleRule: function (oEvent) {
            MessageToast.show("Test single rule clicked");
        },

        onRuleToggle: function (oEvent) {
            var bState = oEvent.getParameter("state");
            MessageToast.show("Rule " + (bState ? "enabled" : "disabled"));
        },

        onRuleSelectionChange: function (oEvent) {
            var oTable = this.byId("rulesTable");
            var aSelectedItems = oTable.getSelectedItems();
            this.getView().getModel().setProperty("/selectedRulesCount", aSelectedItems.length);
        },

        // ==================== EXISTING: EVENT HANDLERS FOR OTHER TABS ====================
        onSearchPOS: function (oEvent) {
            var sQuery = oEvent.getParameter("query");
            MessageToast.show("Search: " + sQuery);
        },

        onExportReport: function () {
            MessageToast.show("Export Report clicked");
        },

        onAutoMatch: function () {
            MessageToast.show("Auto-Match clicked");
        },

        onTransactionPress: function (oEvent) {
            MessageToast.show("Transaction pressed");
        },

        onRefresh: function () {
            // Update to use the new refresh function
            this.onRefreshData();
        },
        // ==================== NEW: CARD PRESS HANDLER ====================

        onCardPress: function (oEvent) {
            var oCard = oEvent.getSource();
            var sCardType = oCard.data("cardType");
            var oModel = this.getView().getModel();
            var sDateFrom = oModel.getProperty("/filterDateFrom");
            var sDateTo = oModel.getProperty("/filterDateTo");


            // Get the main tab bar and switch to Reconciliation tab
            var oTabBar = this.byId("mainTabBar");


            if (!oTabBar) {
                MessageBox.error("Tab bar not found. Please check the ID 'mainTabBar' in your view.");
                return;
            }

            switch (sCardType) {
                case "total":
                    // Show all reconciliation data
                    oTabBar.setSelectedKey("recon");
                    this.filterReconciliationData("all", sDateFrom, sDateTo);
                    MessageToast.show("Showing all reconciliation data");
                    break;


                case "matched":
                    // Show only matched data
                    oTabBar.setSelectedKey("recon");
                    this.filterReconciliationData("matched", sDateFrom, sDateTo);
                    MessageToast.show("Showing matched reconciliation data");
                    break;


                case "discrepancies":
                    // Show only discrepancies/unmatched/ pending data
                    oTabBar.setSelectedKey("recon");
                    this.filterReconciliationData("discrepancies", sDateFrom, sDateTo);
                    MessageToast.show("Showing discrepancies reconciliation data");
                    break;

                    break;

            }
        },

        filterReconciliationData: function (sFilterType, sDateFrom, sDateTo) {
            var oTable = this.byId("posTable");
            if (!oTable) {
                return; // Table not found yet
            }


            var oBinding = oTable.getBinding("items");
            if (!oBinding) {
                return; // Binding not ready yet
            }


            var aFilters = [];


            // Add date filters
            if (sDateFrom && sDateTo) {
                aFilters.push(new Filter("transDate", FilterOperator.BT, sDateFrom, sDateTo));
            }


            // Add status filters based on card type
            switch (sFilterType) {
                case "matched":
                    aFilters.push(new Filter("status", FilterOperator.EQ, "Matched"));
                    break;


                case "discrepancies":
                    aFilters.push(new Filter({
                        filters: [
                            new Filter("status", FilterOperator.EQ, "Unmatched"),
                            new Filter("status", FilterOperator.EQ, "Pending POS"),
                            new Filter("status", FilterOperator.EQ, "Pending Stmt")
                        ],
                        and: false // OR condition
                    }));
                    break;


                case "all":
                default:
                    // No status filter - show all
                    break;
            }


            oBinding.filter(aFilters);


            // Store current filter in model for reference
            this.getView().getModel().setProperty("/currentFilter", sFilterType);
        },

        onClearFilters: function () {
            var oModel = this.getView().getModel();
            var sDateFrom = oModel.getProperty("/filterDateFrom");
            var sDateTo = oModel.getProperty("/filterDateTo");


            this.filterReconciliationData("all", sDateFrom, sDateTo);
            MessageToast.show("Filters cleared - showing all data");
        }




    });
});