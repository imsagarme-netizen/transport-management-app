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
import { useExpenseStore, Expense } from '../store/expenseStore';
import {
  getCategoryColor,
  getCategoryLabel,
  ExpenseCategory,
} from '../utils/expenseHelpers';

interface ExpenseListProps {
  vehicleId?: string;
  onEdit?: (expense: Expense) => void;
  onRefresh?: () => void;
}

/**
 * Expense List Component
 * Displays all expenses with filtering, searching, and actions
 */
const ExpenseList: React.FC<ExpenseListProps> = ({
  vehicleId,
  onEdit,
  onRefresh,
}) => {
  const { expenses, deleteExpense, getExpensesByVehicle } = useExpenseStore();
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory | 'ALL'>('ALL');
  const [refreshing, setRefreshing] = useState(false);

  const filteredExpenses = (() => {
    let filtered = vehicleId ? getExpensesByVehicle(vehicleId) : expenses;

    // Filter by category
    if (selectedCategory !== 'ALL') {
      filtered = filtered.filter((e) => e.category === selectedCategory);
    }

    // Filter by search text
    if (searchText.trim()) {
      filtered = filtered.filter(
        (e) =>
          e.description.toLowerCase().includes(searchText.toLowerCase()) ||
          e.expense_id.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    return filtered.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  })();

  const handleDelete = (expense: Expense) => {
    Alert.alert('Delete Expense', `Delete expense ${expense.expense_id}?`, [
      { text: 'Cancel', onPress: () => {} },
      {
        text: 'Delete',
        onPress: () => {
          deleteExpense(expense.id);
          Alert.alert('Success', 'Expense deleted');
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

  const totalAmount = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  const renderExpenseItem = ({ item }: { item: Expense }) => (
    <TouchableOpacity
      style={styles.expenseCard}
      onPress={() => onEdit?.(item)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleSection}>
          <View
            style={[
              styles.categoryDot,
              { backgroundColor: getCategoryColor(item.category) },
            ]}
          />
          <View>
            <Text style={styles.expenseId}>{item.expense_id}</Text>
            <Text style={styles.description} numberOfLines={1}>
              {item.description}
            </Text>
          </View>
        </View>
        <View style={styles.amountSection}>
          <Text style={styles.amount}>₹{item.amount.toFixed(2)}</Text>
          <Text style={styles.category}>{getCategoryLabel(item.category)}</Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.date}>
          {new Date(item.date).toLocaleDateString('en-IN')}
        </Text>
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

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchSection}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by ID or description..."
          value={searchText}
          onChangeText={setSearchText}
          placeholderTextColor="#95A5A6"
        />
      </View>

      {/* Category Filter */}
      <View style={styles.filterSection}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={['ALL', ...Object.values(ExpenseCategory)]}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterChip,
                selectedCategory === item && styles.filterChipActive,
              ]}
              onPress={() => setSelectedCategory(item as ExpenseCategory | 'ALL')}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedCategory === item && styles.filterChipTextActive,
                ]}
              >
                {item === 'ALL' ? 'All' : getCategoryLabel(item as ExpenseCategory)}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Summary Card */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Total Expenses</Text>
          <Text style={styles.summaryValue}>₹{totalAmount.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Count</Text>
          <Text style={styles.summaryValue}>{filteredExpenses.length}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Average</Text>
          <Text style={styles.summaryValue}>
            ₹{(totalAmount / (filteredExpenses.length || 1)).toFixed(2)}
          </Text>
        </View>
      </View>

      {/* Expense List */}
      {filteredExpenses.length > 0 ? (
        <FlatList
          data={filteredExpenses}
          renderItem={renderExpenseItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#E74C3C']}
            />
          }
        />
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No expenses found</Text>
          <Text style={styles.emptySubtext}>Start logging expenses to see them here</Text>
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
    backgroundColor: '#E74C3C',
    borderColor: '#E74C3C',
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
    borderLeftColor: '#E74C3C',
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
  expenseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 10,
    overflow: 'hidden',
    borderLeftWidth: 4,
    borderLeftColor: '#E74C3C',
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
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
    marginTop: 4,
  },
  expenseId: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
  },
  description: {
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
    color: '#E74C3C',
  },
  category: {
    fontSize: 11,
    color: '#95A5A6',
    marginTop: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#F8F9FA',
  },
  date: {
    fontSize: 12,
    color: '#7F8C8D',
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

export default ExpenseList;
