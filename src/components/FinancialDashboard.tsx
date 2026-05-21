import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useExpenseStore } from '../store/expenseStore';
import { useInvoiceStore } from '../store/invoiceStore';
import { ExpenseCategory, getCategoryColor, getCategoryLabel } from '../utils/expenseHelpers';

const { width } = Dimensions.get('window');

/**
 * Financial Dashboard Component
 * Displays comprehensive financial overview with analytics
 */
const FinancialDashboard: React.FC = () => {
  const { expenses, getTotalExpenses, getCategoryTotal } = useExpenseStore();
  const { invoices, getTotalInvoiceAmount, getTotalPaidAmount, getTotalPendingAmount } =
    useInvoiceStore();

  const totalExpenses = useMemo(() => getTotalExpenses(), [expenses]);
  const totalInvoiceAmount = useMemo(() => getTotalInvoiceAmount(), [invoices]);
  const totalPaid = useMemo(() => getTotalPaidAmount(), [invoices]);
  const totalPending = useMemo(() => getTotalPendingAmount(), [invoices]);

  const categoryBreakdown = useMemo(() => {
    return Object.values(ExpenseCategory).map((category) => ({
      category,
      amount: getCategoryTotal(category),
    }));
  }, [expenses]);

  const topExpenseCategory = useMemo(() => {
    if (categoryBreakdown.length === 0) return null;
    return categoryBreakdown.reduce((max, current) =>
      current.amount > max.amount ? current : max
    );
  }, [categoryBreakdown]);

  const overallProfit = totalInvoiceAmount - totalExpenses;
  const profitMargin = totalInvoiceAmount > 0 ? (overallProfit / totalInvoiceAmount) * 100 : 0;

  const paymentCollectionRate = totalInvoiceAmount > 0 ? (totalPaid / totalInvoiceAmount) * 100 : 0;

  const renderDashboardCard = (
    title: string,
    value: string,
    subtext?: string,
    color: string = '#2C3E50'
  ) => (
    <View style={styles.dashboardCard}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={[styles.cardValue, { color }]}>{value}</Text>
      {subtext && <Text style={styles.cardSubtext}>{subtext}</Text>}
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Main KPIs */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Financial Summary</Text>

        <View style={styles.kpiRow}>
          {renderDashboardCard(
            'Total Revenue',
            `₹${totalInvoiceAmount.toFixed(2)}`,
            `${invoices.length} invoices`,
            '#27AE60'
          )}
          {renderDashboardCard(
            'Total Expenses',
            `₹${totalExpenses.toFixed(2)}`,
            `${expenses.length} expenses`,
            '#E74C3C'
          )}
        </View>

        <View style={styles.kpiRow}>
          {renderDashboardCard(
            'Gross Profit',
            `₹${overallProfit.toFixed(2)}`,
            `${profitMargin.toFixed(1)}% margin`,
            overallProfit >= 0 ? '#27AE60' : '#E74C3C'
          )}
          {renderDashboardCard(
            'Payment Collection',
            `₹${totalPaid.toFixed(2)}`,
            `${paymentCollectionRate.toFixed(1)}% collected`,
            '#3498DB'
          )}
        </View>
      </View>

      {/* Invoice Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Invoice Status</Text>

        <View style={styles.statusGrid}>
          <View style={styles.statusCard}>
            <Text style={styles.statusLabel}>Total Amount</Text>
            <Text style={[styles.statusValue, { color: '#2C3E50' }]}>
              ₹{totalInvoiceAmount.toFixed(2)}
            </Text>
          </View>

          <View style={styles.statusCard}>
            <Text style={styles.statusLabel}>Paid</Text>
            <Text style={[styles.statusValue, { color: '#27AE60' }]}>
              ₹{totalPaid.toFixed(2)}
            </Text>
          </View>

          <View style={styles.statusCard}>
            <Text style={styles.statusLabel}>Pending</Text>
            <Text style={[styles.statusValue, { color: '#E74C3C' }]}>
              ₹{totalPending.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Payment Collection Progress */}
        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Payment Collection Rate</Text>
            <Text style={styles.progressValue}>{paymentCollectionRate.toFixed(1)}%</Text>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min(paymentCollectionRate, 100)}%`,
                  backgroundColor: '#27AE60',
                },
              ]}
            />
          </View>
        </View>
      </View>

      {/* Expense Breakdown */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Expense Breakdown by Category</Text>

        {categoryBreakdown.length > 0 ? (
          <View style={styles.categoryList}>
            {categoryBreakdown
              .filter((item) => item.amount > 0)
              .sort((a, b) => b.amount - a.amount)
              .map((item, index) => {
                const percentage = (item.amount / totalExpenses) * 100;
                return (
                  <View key={index} style={styles.categoryItem}>
                    <View style={styles.categoryHeader}>
                      <View style={styles.categoryInfo}>
                        <View
                          style={[
                            styles.categoryColor,
                            { backgroundColor: getCategoryColor(item.category) },
                          ]}
                        />
                        <View style={styles.categoryText}>
                          <Text style={styles.categoryName}>
                            {getCategoryLabel(item.category)}
                          </Text>
                          <Text style={styles.categoryAmount}>
                            ₹{item.amount.toFixed(2)}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.categoryPercentage}>{percentage.toFixed(1)}%</Text>
                    </View>
                    <View style={styles.categoryBar}>
                      <View
                        style={[
                          styles.categoryBarFill,
                          {
                            width: `${percentage}%`,
                            backgroundColor: getCategoryColor(item.category),
                          },
                        ]}
                      />
                    </View>
                  </View>
                );
              })}
          </View>
        ) : (
          <Text style={styles.emptyText}>No expenses recorded</Text>
        )}
      </View>

      {/* Top Expense Category */}
      {topExpenseCategory && topExpenseCategory.amount > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Expense Category</Text>
          <View style={styles.topCategoryCard}>
            <View
              style={[
                styles.topCategoryDot,
                { backgroundColor: getCategoryColor(topExpenseCategory.category) },
              ]}
            />
            <View style={styles.topCategoryInfo}>
              <Text style={styles.topCategoryLabel}>
                {getCategoryLabel(topExpenseCategory.category)}
              </Text>
              <Text style={styles.topCategoryAmount}>
                ₹{topExpenseCategory.amount.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Summary Statistics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Statistics</Text>

        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Avg. Expense</Text>
            <Text style={styles.statValue}>
              ₹{(totalExpenses / (expenses.length || 1)).toFixed(2)}
            </Text>
          </View>

          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Avg. Invoice</Text>
            <Text style={styles.statValue}>
              ₹{(totalInvoiceAmount / (invoices.length || 1)).toFixed(2)}
            </Text>
          </View>

          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Expense Ratio</Text>
            <Text style={styles.statValue}>
              {totalInvoiceAmount > 0
                ? ((totalExpenses / totalInvoiceAmount) * 100).toFixed(1)
                : '0'}%
            </Text>
          </View>

          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Pending Invoices</Text>
            <Text style={styles.statValue}>
              {invoices.filter((i) => i.payment_status !== 'paid').length}
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    paddingTop: 12,
  },
  section: {
    paddingHorizontal: 12,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 12,
  },
  kpiRow: {
    flexDirection: 'row',
    gap: 10,
  },
  dashboardCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 12,
    color: '#7F8C8D',
    fontWeight: '500',
    marginBottom: 6,
  },
  cardValue: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  cardSubtext: {
    fontSize: 11,
    color: '#95A5A6',
  },
  statusGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  statusCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 11,
    color: '#7F8C8D',
    fontWeight: '500',
    marginBottom: 6,
  },
  statusValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  progressContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2C3E50',
  },
  progressValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#27AE60',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#ECF0F1',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  categoryList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
  },
  categoryItem: {
    marginBottom: 16,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  categoryText: {
    flex: 1,
  },
  categoryName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2C3E50',
  },
  categoryAmount: {
    fontSize: 11,
    color: '#7F8C8D',
    marginTop: 2,
  },
  categoryPercentage: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2C3E50',
  },
  categoryBar: {
    height: 6,
    backgroundColor: '#ECF0F1',
    borderRadius: 3,
    overflow: 'hidden',
  },
  categoryBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  topCategoryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  topCategoryDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
  },
  topCategoryInfo: {
    flex: 1,
  },
  topCategoryLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
  },
  topCategoryAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#E74C3C',
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statItem: {
    width: (width - 36) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
  },
  statLabel: {
    fontSize: 12,
    color: '#7F8C8D',
    fontWeight: '500',
    marginBottom: 6,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2C3E50',
  },
  emptyText: {
    fontSize: 14,
    color: '#95A5A6',
    textAlign: 'center',
    paddingVertical: 20,
  },
});

export default FinancialDashboard;
