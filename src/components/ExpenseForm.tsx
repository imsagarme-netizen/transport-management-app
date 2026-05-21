import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Picker,
} from 'react-native';
import { useExpenseStore } from '../store/expenseStore';
import { useVehicleStore } from '../store/vehicleStore';
import {
  ExpenseCategory,
  getCategoryColor,
  getCategoryLabel,
  generateExpenseId,
  validateExpense,
} from '../utils/expenseHelpers';

interface ExpenseFormProps {
  vehicleId?: string;
  tripId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

/**
 * Expense Form Component
 * Used for adding and editing expenses
 */
const ExpenseForm: React.FC<ExpenseFormProps> = ({
  vehicleId,
  tripId,
  onSuccess,
  onCancel,
}) => {
  const { expenses, addExpense } = useExpenseStore();
  const { vehicles } = useVehicleStore();

  const [formData, setFormData] = useState({
    expense_id: generateExpenseId(expenses.length),
    vehicle_id: vehicleId || (vehicles.length > 0 ? vehicles[0].id : ''),
    trip_id: tripId || '',
    category: ExpenseCategory.FUEL,
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const validation = validateExpense({
      description: formData.description,
      amount: parseFloat(formData.amount),
      category: formData.category,
      trip_id: formData.trip_id,
      date: formData.date,
    });

    if (!validation.isValid) {
      const newErrors: Record<string, string> = {};
      validation.errors.forEach((error) => {
        const field = error.toLowerCase().split(' ')[0];
        newErrors[field] = error;
      });
      setErrors(newErrors);
      return false;
    }

    if (!formData.vehicle_id) {
      setErrors({ vehicle_id: 'Vehicle is required' });
      return false;
    }

    setErrors({});
    return true;
  };

  const handleAddExpense = () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fill all required fields correctly');
      return;
    }

    try {
      const newExpense = addExpense({
        expense_id: formData.expense_id,
        vehicle_id: formData.vehicle_id,
        trip_id: formData.trip_id,
        category: formData.category,
        description: formData.description,
        amount: parseFloat(formData.amount),
        date: formData.date,
        notes: formData.notes,
      });

      Alert.alert('Success', `Expense ${newExpense.expense_id} logged successfully`);
      onSuccess?.();
    } catch (error) {
      Alert.alert('Error', 'Failed to log expense');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Log Expense</Text>

      {/* Expense ID (Auto-generated, Read-only) */}
      <View style={styles.section}>
        <Text style={styles.label}>Expense ID (Auto-generated)</Text>
        <TextInput
          style={[styles.input, styles.readOnly]}
          value={formData.expense_id}
          editable={false}
        />
      </View>

      {/* Vehicle Selection */}
      <View style={styles.sectionGroup}
        <Text style={styles.groupTitle}>Expense Details</Text>

        {!vehicleId && (
          <View style={styles.section}>
            <Text style={styles.label}>
              Vehicle <Text style={styles.required}>*</Text>
            </Text>
            <View style={[styles.picker, errors.vehicle_id && styles.pickerError]}>
              <Picker
                selectedValue={formData.vehicle_id}
                onValueChange={(itemValue) =>
                  setFormData({ ...formData, vehicle_id: itemValue })
                }
              >
                <Picker.Item label="Select a vehicle" value="" />
                {vehicles.map((vehicle) => (
                  <Picker.Item
                    key={vehicle.id}
                    label={`${vehicle.registration_number}`}
                    value={vehicle.id}
                  />
                ))}
              </Picker>
            </View>
            {errors.vehicle_id && <Text style={styles.error}>{errors.vehicle_id}</Text>}
          </View>
        )}

        {/* Category Selection */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Category <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.picker}>
            <Picker
              selectedValue={formData.category}
              onValueChange={(itemValue) =>
                setFormData({ ...formData, category: itemValue })
              }
            >
              {Object.values(ExpenseCategory).map((category) => (
                <Picker.Item
                  key={category}
                  label={getCategoryLabel(category)}
                  value={category}
                />
              ))}
            </Picker>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Description <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, errors.description && styles.inputError]}
            placeholder="Expense description"
            value={formData.description}
            onChangeText={(text) =>
              setFormData({ ...formData, description: text })
            }
          />
          {errors.description && (
            <Text style={styles.error}>{errors.description}</Text>
          )}
        </View>

        {/* Amount */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Amount (₹) <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, errors.amount && styles.inputError]}
            placeholder="0.00"
            keyboardType="decimal-pad"
            value={formData.amount}
            onChangeText={(text) =>
              setFormData({ ...formData, amount: text })
            }
          />
          {errors.amount && <Text style={styles.error}>{errors.amount}</Text>}
        </View>

        {/* Date */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Date <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, errors.date && styles.inputError]}
            placeholder="YYYY-MM-DD"
            value={formData.date}
            onChangeText={(text) =>
              setFormData({ ...formData, date: text })
            }
          />
          {errors.date && <Text style={styles.error}>{errors.date}</Text>}
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Additional notes"
            multiline
            numberOfLines={3}
            value={formData.notes}
            onChangeText={(text) =>
              setFormData({ ...formData, notes: text })
            }
          />
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonGroup}>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.submitButton} onPress={handleAddExpense}>
          <Text style={styles.buttonText}>Log Expense</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F8F9FA',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
    color: '#2C3E50',
  },
  sectionGroup: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#E74C3C',
  },
  groupTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#2C3E50',
  },
  section: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    color: '#34495E',
  },
  required: {
    color: '#E74C3C',
  },
  input: {
    borderWidth: 1,
    borderColor: '#BDC3C7',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    backgroundColor: '#FFFFFF',
  },
  inputError: {
    borderColor: '#E74C3C',
  },
  readOnly: {
    backgroundColor: '#ECF0F1',
    color: '#7F8C8D',
  },
  picker: {
    borderWidth: 1,
    borderColor: '#BDC3C7',
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  pickerError: {
    borderColor: '#E74C3C',
  },
  textArea: {
    textAlignVertical: 'top',
    height: 80,
  },
  error: {
    color: '#E74C3C',
    fontSize: 12,
    marginTop: 4,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
    marginBottom: 32,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#95A5A6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#E74C3C',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ExpenseForm;
