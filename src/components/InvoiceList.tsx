import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  RefreshControl,
} from 'react-native';
import { useInvoiceStore, Invoice } from '../store/invoiceStore';
import {
  getInvoiceStatusColor,
  getInvoiceStatusLabel,
  getPaymentStatusColor,
  getPaymentStatusLabel,
  InvoiceStatus,
  PaymentStatus,
  isInvoiceOverdue,
  getDaysUntilDue,
} from '../utils/invoiceHelpers';

interface InvoiceListProps {
  onEdit?: (invoice: Invoice) => void;
  onRefresh?: () => void;
}

/**
 * Invoice List Component
 * Displays all invoices with filtering, searching, and actions
 */
const InvoiceList: React.FC<InvoiceListProps> = ({ onEdit, onRefresh }) => {
  const { invoices, deleteInvoice } = useInvoiceStore();
  const [searchText, setSearchText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<InvoiceStatus | 'ALL'>('ALL');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<PaymentStatus | 'ALL'>('ALL');
  const [refreshing, setRefreshing] = useState(false);

  const filteredInvoices = (() => {
    let filtered = invoices;

    // Filter by invoice status
    if (selectedStatus !== 'ALL') {
      filtered = filtered.filter((i) => i.status === selectedStatus);
    }

    // Filter by payment status
    if (selectedPaymentStatus !== 'ALL') {
      filtered = filtered.filter((i) => i.payment_status === selectedPaymentStatus);
    }

    // Filter by search text
    if (searchText.trim()) {
      filtered = filtered.filter(
        (i) =>
          i.invoice_number.toLowerCase().includes(searchText.toLowerCase()) ||
          i.vendor_name.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    return filtered.sort(
      (a, b) => new Date(b.issued_date).getTime() - new Date(a.issued_date).getTime()
    );
  })();

  const handleDelete = (invoice: Invoice) => {
    Alert.alert('Delete Invoice', `Delete invoice ${invoice.invoice_number}?`, [
      { text: 'Cancel', onPress: () => {} },
      {
        text: 'Delete',
        onPress: () => {
          deleteInvoice(invoice.id);
          Alert.alert('Success', 'Invoice deleted');
        },
        style: 'destructive',
      },
    ]);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      onRefresh?.();
      setRefreshing(false);
    }, 500);
  };

  const totalAmount = filteredInvoices.reduce((sum, i) => sum + i.total_amount, 0);
  const totalPaid = filteredInvoices.reduce((sum, i) => sum + i.amount_paid, 0);
  const totalPending = totalAmount - totalPaid;

  const renderInvoiceItem = ({ item }: { item: Invoice }) => {
    const isOverdue = isInvoiceOverdue(item.due_date);
    const daysUntilDue = getDaysUntilDue(item.due_date);

    return (
      <TouchableOpacity
        style={styles.invoiceCard}
        onPress={() => onEdit?.(item)}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleSection}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: getInvoiceStatusColor(item.status) },
              ]}
            />
            <View>
              <Text style={styles.invoiceNumber}>{item.invoice_number}</Text>
              <Text style={styles.vendorName} numberOfLines={1}>
                {item.vendor_name}
              </Text>
            </View>
          </View>
          <View style={styles.amountSection}>
            <Text style={styles.amount}>₹{item.total_amount.toFixed(2)}</Text>
            <Text
              style={[
                styles.paymentStatus,
                { color: getPaymentStatusColor(item.payment_status) },
              ]}
            >
              {getPaymentStatusLabel(item.payment_status)}
            </Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressSection}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${(totalPaid / totalAmount) * 100 || 0}%`,
                  backgroundColor: item.payment_status === PaymentStatus.PAID ? '#27AE60' : '#F39C12',
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            ₹{item.amount_paid.toFixed(2)} / ₹{item.total_amount.toFixed(2)}
          </Text>
        </View>

        <View style={styles.cardFooter}>
          <View>
            <Text style={styles.dueDate}>
              Due: {new Date(item.due_date).toLocaleDateString('en-IN')}
            </Text>
            {isOverdue && daysUntilDue < 0 && (
              <Text style={styles.overdue}>Overdue by {Math.abs(daysUntilDue)} days</Text>
            )}
          </View>
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => onEdit?.(item)}
            >
              <Text style={styles.actionText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => handleDelete(item)}
            >
              <Text style={styles.actionText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchSection}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by invoice or vendor..."
          value={searchText}
          onChangeText={setSearchText}
          placeholderTextColor="#95A5A6"
        />
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterSection}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[
            { label: 'All', value: 'ALL' },
            { label: 'Paid', value: PaymentStatus.PAID },
            { label: 'Unpaid', value: PaymentStatus.UNPAID },
            { label: 'Partial', value: PaymentStatus.PARTIAL },
          ]}
          keyExtractor={(item) => item.value}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterChip,
                selectedPaymentStatus === item.value && styles.filterChipActive,
              ]}
              onPress={() => setSelectedPaymentStatus(item.value as PaymentStatus | 'ALL')}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedPaymentStatus === item.value && styles.filterChipTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Total Amount</Text>
          <Text style={styles.summaryValue}>₹{totalAmount.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Paid</Text>
          <Text style={[styles.summaryValue, { color: '#27AE60' }]}>
            ₹{totalPaid.toFixed(2)}
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Pending</Text>
          <Text style={[styles.summaryValue, { color: '#E74C3C' }]}>
            ₹{totalPending.toFixed(2)}
          </Text>
        </View>
      </View>

      {/* Invoice List */}
      {filteredInvoices.length > 0 ? (
        <FlatList
          data={filteredInvoices}
          renderItem={renderInvoiceItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#27AE60']}
            />
          }
        />
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No invoices found</Text>
          <Text style={styles.emptySubtext}>Create invoices to see them here</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  searchSection: {
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#ECF0F1',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#BDC3C7',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: '#F8F9FA',
  },
  filterSection: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#BDC3C7',
    backgroundColor: '#FFFFFF',
  },
  filterChipActive: {
    backgroundColor: '#27AE60',
    borderColor: '#27AE60',
  },
  filterChipText: {
    fontSize: 12,
    color: '#34495E',
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    margin: 12,
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#27AE60',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#7F8C8D',
    fontWeight: '500',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    color: '#2C3E50',
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: 12,
    paddingBottom: 16,
  },
  invoiceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 10,
    overflow: 'hidden',
    borderLeftWidth: 4,
    borderLeftColor: '#27AE60',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ECF0F1',
  },
  cardTitleSection: {
    flexDirection: 'row',
    flex: 1,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
    marginTop: 4,
  },
  invoiceNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
  },
  vendorName: {
    fontSize: 12,
    color: '#7F8C8D',
    marginTop: 2,
  },
  amountSection: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#27AE60',
  },
  paymentStatus: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  progressSection: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#ECF0F1',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 11,
    color: '#7F8C8D',
    textAlign: 'right',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#F8F9FA',
  },
  dueDate: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  overdue: {
    fontSize: 11,
    color: '#E74C3C',
    fontWeight: '600',
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  editBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#3498DB',
    borderRadius: 4,
  },
  deleteBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#E74C3C',
    borderRadius: 4,
  },
  actionText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#34495E',
  },
  emptySubtext: {
    fontSize: 12,
    color: '#95A5A6',
    marginTop: 4,
  },
});

export default InvoiceList;
