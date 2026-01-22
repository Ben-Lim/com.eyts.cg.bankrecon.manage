sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Sorter"
], function (Controller, JSONModel, MessageToast, MessageBox, Filter, FilterOperator, Sorter) {
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
                
                // Mock data for transactions
                transactions: [
                    {
                transactionId: "123456789",
                date: "2026-01-22",
                product: "12345",
                sku: "SKU1234",
                netAmount: '299.99',
                settlement: '299.99',
                variance: '0',
                status: "Matched"
            },
            {
                transactionId: "234567890",
                date: "2026-01-22",
                product: "23456",
                sku: "SKU2345",
                netAmount: '149.99',
                settlement: '149.99',
                variance: '0',
                status: "Matched"
            },
            {
                transactionId: "290192922",
                date: "2026-01-22",
                product: "5432",
                sku: "SKU5432",
                netAmount: '89.99',
                settlement: '85.00',
                variance: '4.99',
                status: "Unmatched"
            },
            {
                transactionId: "172839112",
                date: "2026-01-21",
                product: "5311",
                sku: "SKU5311",
                netAmount: '399.99',
                settlement: '399.99',
                variance: '0',
                status: "Matched"
            },
            {
                transactionId: "299186384",
                date: "2026-01-21",
                product: "5733",
                sku: "SKU5733",
                netAmount: "59.99",
                settlement: "50.00",
                variance: "9.99",
                status: "Unmatched"
            },
            {
                transactionId: "288094632",
                date: "2026-01-20",
                product: "5999",
                sku: "SKU5999",
                netAmount: "259.99",
                settlement: "00.00",
                variance: "259.99",
                status: "Pending"
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

        // ==================== NEW: DATE FILTER FUNCTIONS ====================
        
        _getFormattedDate: function(daysOffset) {
            var date = new Date();
            date.setDate(date.getDate() + daysOffset);
            return date.toISOString().split('T')[0];
        },

        onQuickDateFilter: function(oEvent) {
            var sKey = oEvent.getParameter("item").getKey();
            var oModel = this.getView().getModel();
            var fromDate, toDate;
            
            switch(sKey) {
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
        },

        onDateChange: function() {
            var oModel = this.getView().getModel();
            oModel.setProperty("/selectedDateRange", "custom");
            this.loadDashboardData();
        },

        onRefreshData: function() {
            sap.ui.core.BusyIndicator.show(0);
            this.loadDashboardData();
        },

        onAutoRefreshToggle: function(oEvent) {
            var bState = oEvent.getParameter("state");
            
            if (bState) {
                // Start auto-refresh every 2 minutes
                this._autoRefreshInterval = setInterval(() => {
                    this.loadDashboardData();
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

        loadDashboardData: function() {
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
            
            /* UNCOMMENT THIS WHEN YOU HAVE A REAL ODATA SERVICE:
            
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

        loadRecentActivity: function(aFilters) {
            var oModel = this.getView().getModel();
            
            // Mock data - in real scenario, this would come from your backend
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
                    }
            ];
            
            oModel.setProperty("/recentActivity", aActivity);
            
            /* UNCOMMENT THIS WHEN YOU HAVE A REAL ODATA SERVICE:
            
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

        _formatTimestamp: function(sTimestamp) {
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
                return "Yesterday at " + oDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            } else if (diffDays < 7) {
                return diffDays + " days ago";
            } else {
                return oDate.toLocaleDateString() + " " + oDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            }
        },

        _getActivityIcon: function(sType) {
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

        onExit: function() {
            // Clean up auto-refresh interval
            if (this._autoRefreshInterval) {
                clearInterval(this._autoRefreshInterval);
            }
        },

        // ==================== EXISTING: EVENT HANDLERS FOR RULES ENGINE ====================
        
        onAddRule: function() {
            MessageToast.show("Add New Rule clicked");
        },

        onEditRule: function(oEvent) {
            MessageToast.show("Edit Rule clicked");
        },

        onDeleteRule: function(oEvent) {
            MessageToast.show("Delete Rule clicked");
        },

        onTestRules: function() {
            MessageToast.show("Test Selected Rules clicked");
        },

        onDeleteSelectedRules: function() {
            var oTable = this.byId("rulesTable");
            var aSelectedItems = oTable.getSelectedItems();
            MessageToast.show("Delete " + aSelectedItems.length + " selected rules");
        },

        onTestSingleRule: function(oEvent) {
            MessageToast.show("Test single rule clicked");
        },

        onRuleToggle: function(oEvent) {
            var bState = oEvent.getParameter("state");
            MessageToast.show("Rule " + (bState ? "enabled" : "disabled"));
        },

        onRuleSelectionChange: function(oEvent) {
            var oTable = this.byId("rulesTable");
            var aSelectedItems = oTable.getSelectedItems();
            this.getView().getModel().setProperty("/selectedRulesCount", aSelectedItems.length);
        },

        // ==================== EXISTING: EVENT HANDLERS FOR OTHER TABS ====================
        
        onSearchPOS: function(oEvent) {
            var sQuery = oEvent.getParameter("query");
            MessageToast.show("Search: " + sQuery);
        },

        onExportReport: function() {
            MessageToast.show("Export Report clicked");
        },

        onAutoMatch: function() {
            MessageToast.show("Auto-Match clicked");
        },

        onTransactionPress: function(oEvent) {
            MessageToast.show("Transaction pressed");
        },

        onReviewTransaction: function(oEvent) {
            MessageToast.show("Review transaction clicked");
        },

        onRefresh: function() {
            // Update to use the new refresh function
            this.onRefreshData();
        },

        // ==================== NEW: CARD PRESS HANDLER ====================
        
        onCardPress: function(oEvent) {
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
            
            switch(sCardType) {
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
                    // Show only discrepancies/unmatched data
                    oTabBar.setSelectedKey("recon");
                    this.filterReconciliationData("discrepancies", sDateFrom, sDateTo);
                    MessageToast.show("Showing discrepancy data");
                    break; 
                
            }
        },

        filterReconciliationData: function(sFilterType, sDateFrom, sDateTo) {
            var oTable = this.byId("posTable");
            var oBinding = oTable.getBinding("items");
            var aFilters = [];
            
            // Add date filters
            if (sDateFrom && sDateTo) {
                aFilters.push(new Filter("date", FilterOperator.BT, sDateFrom, sDateTo));
            }
            
            // Add status filters based on card type
            switch(sFilterType) {
                case "matched":
                    aFilters.push(new Filter("status", FilterOperator.EQ, "Matched"));
                    break;
                    
                case "discrepancies":
                    aFilters.push(new Filter({
                        filters: [
                            new Filter("status", FilterOperator.EQ, "Unmatched"),
                            new Filter("status", FilterOperator.EQ, "Pending")
                        ],
                        and: false // OR condition
                    }));
                    break;
                    
                case "all":
                default:
                    // No status filter - show all
                    break;
            }
            
            if (oBinding) {
                oBinding.filter(aFilters);
            }
            
            // Store current filter in model for reference
            this.getView().getModel().setProperty("/currentFilter", sFilterType);
        },

        onClearFilters: function() {
            var oModel = this.getView().getModel();
            var sDateFrom = oModel.getProperty("/filterDateFrom");
            var sDateTo = oModel.getProperty("/filterDateTo");
            
            this.filterReconciliationData("all", sDateFrom, sDateTo);
            MessageToast.show("Filters cleared - showing all data");
        }
    });
});