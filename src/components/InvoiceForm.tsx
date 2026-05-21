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
import { useInvoiceStore } from '../store/invoiceStore';
import {
  generateInvoiceNumber,
  validateInvoice,
  calculateGST,
  calculateInvoiceTotal,
  InvoiceStatus,
  PaymentStatus,
} from '../utils/invoiceHelpers';

interface InvoiceFormProps {
  tripId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

/**
 * Invoice Form Component
 * Used for creating invoices
 */
const InvoiceForm: React.FC<InvoiceFormProps> = ({
  tripId,
  onSuccess,
  onCancel,
}) => {
  const { invoices, addInvoice } = useInvoiceStore();

  const [formData, setFormData] = useState({
    invoice_number: generateInvoiceNumber(invoices.length),
    vendor_name: '',
    amount: '',
    issued_date: new Date().toISOString().split('T')[0],
    due_date: '',
    notes: '',
    trip_id: tripId || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const validation = validateInvoice({
      invoice_number: formData.invoice_number,
      vendor_name: formData.vendor_name,
      amount: parseFloat(formData.amount),
      due_date: formData.due_date,
      trip_id: formData.trip_id,
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

    setErrors({});
    return true;
  };

  const handleAddInvoice = () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fill all required fields correctly');
      return;
    }

    try {
      const amount = parseFloat(formData.amount);
      const gstAmount = calculateGST(amount);
      const totalAmount = calculateInvoiceTotal(amount);

      const newInvoice = addInvoice({
        invoice_number: formData.invoice_number,
        vendor_name: formData.vendor_name,
        amount: amount,
        gst_amount: gstAmount,
        total_amount: totalAmount,
        amount_paid: 0,
        status: InvoiceStatus.ISSUED,
        payment_status: PaymentStatus.UNPAID,
        issued_date: formData.issued_date,
        due_date: formData.due_date,
        trip_id: formData.trip_id,
        notes: formData.notes,
      });

      Alert.alert('Success', `Invoice ${newInvoice.invoice_number} created successfully`);
      onSuccess?.();
    } catch (error) {
      Alert.alert('Error', 'Failed to create invoice');
    }
  };

  const amount = parseFloat(formData.amount) || 0;
  const gstAmount = calculateGST(amount);
  const totalAmount = calculateInvoiceTotal(amount);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Create Invoice</Text>

      {/* Invoice Number (Auto-generated, Read-only) */}
      <View style={styles.section}>
        <Text style={styles.label}>Invoice Number (Auto-generated)</Text>
        <TextInput
          style={[styles.input, styles.readOnly]}
          value={formData.invoice_number}
          editable={false}
        />
      </View>

      {/* Invoice Details */}
      <View style={styles.sectionGroup}>
        <Text style={styles.groupTitle}>Vendor & Amount</Text>

        <View style={styles.section}>
          <Text style={styles.label}>
            Vendor Name <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, errors.vendor_name && styles.inputError]}
            placeholder="Vendor or company name"
            value={formData.vendor_name}
            onChangeText={(text) =>
              setFormData({ ...formData, vendor_name: text })
            }
          />
          {errors.vendor_name && (
            <Text style={styles.error}>{errors.vendor_name}</Text>
          )}
        </View>

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
      </View>

      {/* GST & Total (Read-only Summary) */}
      <View style={styles.sectionGroup}>
        <Text style={styles.groupTitle}>Tax & Total</Text>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Base Amount:</Text>
          <Text style={styles.summaryValue}>₹{amount.toFixed(2)}</Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>GST (18%):</Text>
          <Text style={styles.summaryValue}>₹{gstAmount.toFixed(2)}</Text>
        </View>

        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total Amount:</Text>
          <Text style={styles.totalValue}>₹{totalAmount.toFixed(2)}</Text>
        </View>
      </View>

      {/* Dates */}
      <View style={styles.sectionGroup}>
        <Text style={styles.groupTitle}>Dates</Text>

        <View style={styles.section}>
          <Text style={styles.label}>Issued Date</Text>
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD"
            value={formData.issued_date}
            onChangeText={(text) =>
              setFormData({ ...formData, issued_date: text })
            }
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>
            Due Date <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, errors.due_date && styles.inputError]}
            placeholder="YYYY-MM-DD"
            value={formData.due_date}
            onChangeText={(text) =>
              setFormData({ ...formData, due_date: text })
            }
          />
          {errors.due_date && <Text style={styles.error}>{errors.due_date}</Text>}
        </View>
      </View>

      {/* Notes */}
      <View style={styles.section}>
        <Text style={styles.label}>Notes</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Additional invoice notes"
          multiline
          numberOfLines={3}
          value={formData.notes}
          onChangeText={(text) =>
            setFormData({ ...formData, notes: text })
          }
        />
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonGroup}>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.submitButton} onPress={handleAddInvoice}>
          <Text style={styles.buttonText}>Create Invoice</Text>
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
    borderLeftColor: '#27AE60',
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
  textArea: {
    textAlignVertical: 'top',
    height: 80,
  },
  error: {
    color: '#E74C3C',
    fontSize: 12,
    marginTop: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ECF0F1',
  },
  totalRow: {
    borderBottomWidth: 0,
    backgroundColor: '#F0F8FF',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 6,
    marginTop: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#34495E',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 14,
    color: '#2C3E50',
    fontWeight: '600',
  },
  totalLabel: {
    fontSize: 16,
    color: '#27AE60',
    fontWeight: '700',
  },
  totalValue: {
    fontSize: 16,
    color: '#27AE60',
    fontWeight: '700',
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
    backgroundColor: '#27AE60',
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

export default InvoiceForm;
