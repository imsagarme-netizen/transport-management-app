import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { useLRStore } from '../store/lrStore';
import { generateLRNumber, validateLRPhoneNumber, validateLR } from '../utils/lrHelpers';

interface LorryReceiptFormProps {
  tripId: string;
  vehicleId: string;
  driverId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

/**
 * Lorry Receipt (LR) Form Component
 * Used for adding and editing LRs
 */
const LorryReceiptForm: React.FC<LorryReceiptFormProps> = ({
  tripId,
  vehicleId,
  driverId,
  onSuccess,
  onCancel,
}) => {
  const { lrs, addLR } = useLRStore();

  const [formData, setFormData] = useState({
    lr_number: generateLRNumber(lrs.length),
    consignor_name: '',
    consignor_phone: '',
    consignor_address: '',
    consignee_name: '',
    consignee_phone: '',
    consignee_address: '',
    goods_description: '',
    weight_kg: '',
    freight_amount: '',
    gst_applicable: false,
    gst_amount: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const formValidation = validateLR({
      lr_number: formData.lr_number,
      consignor_name: formData.consignor_name,
      consignor_phone: formData.consignor_phone,
      consignee_name: formData.consignee_name,
      consignee_phone: formData.consignee_phone,
      goods_description: formData.goods_description,
      weight_kg: parseFloat(formData.weight_kg),
      freight_amount: parseFloat(formData.freight_amount),
    });

    if (!formValidation.isValid) {
      const newErrors: Record<string, string> = {};
      formValidation.errors.forEach((error) => {
        const field = error.toLowerCase().split(' ')[0];
        newErrors[field] = error;
      });
      setErrors(newErrors);
      return false;
    }

    setErrors({});
    return true;
  };

  const handleAddLR = () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fill all required fields correctly');
      return;
    }

    try {
      const gstAmount = formData.gst_applicable
        ? (parseFloat(formData.freight_amount) * 0.18) // 18% GST
        : 0;

      const newLR = addLR({
        lr_number: formData.lr_number,
        trip_id: tripId,
        vehicle_id: vehicleId,
        driver_id: driverId,
        consignor_name: formData.consignor_name,
        consignor_phone: formData.consignor_phone,
        consignor_address: formData.consignor_address,
        consignee_name: formData.consignee_name,
        consignee_phone: formData.consignee_phone,
        consignee_address: formData.consignee_address,
        goods_description: formData.goods_description,
        weight_kg: parseFloat(formData.weight_kg),
        freight_amount: parseFloat(formData.freight_amount),
        status: 'created',
        gst_applicable: formData.gst_applicable,
        gst_amount: gstAmount,
      });

      Alert.alert('Success', `LR ${newLR.lr_number} created successfully`);
      onSuccess?.();
    } catch (error) {
      Alert.alert('Error', 'Failed to create LR');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Create Lorry Receipt (LR)</Text>

      {/* LR Number (Auto-generated, Read-only) */}
      <View style={styles.section}>
        <Text style={styles.label}>LR Number (Auto-generated)</Text>
        <TextInput
          style={[styles.input, styles.readOnly]}
          value={formData.lr_number}
          editable={false}
        />
      </View>

      {/* Consignor Section */}
      <View style={styles.sectionGroup}>
        <Text style={styles.groupTitle}>Consignor Details</Text>

        <View style={styles.section}>
          <Text style={styles.label}>
            Name <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, errors.consignor_name && styles.inputError]}
            placeholder="Consignor name"
            value={formData.consignor_name}
            onChangeText={(text) =>
              setFormData({ ...formData, consignor_name: text })
            }
          />
          {errors.consignor_name && (
            <Text style={styles.error}>{errors.consignor_name}</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>
            Phone <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, errors.consignor_phone && styles.inputError]}
            placeholder="10-digit phone number"
            keyboardType="phone-pad"
            value={formData.consignor_phone}
            onChangeText={(text) =>
              setFormData({ ...formData, consignor_phone: text })
            }
          />
          {errors.consignor_phone && (
            <Text style={styles.error}>{errors.consignor_phone}</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Address</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Consignor address"
            multiline
            numberOfLines={2}
            value={formData.consignor_address}
            onChangeText={(text) =>
              setFormData({ ...formData, consignor_address: text })
            }
          />
        </View>
      </View>

      {/* Consignee Section */}
      <View style={styles.sectionGroup}>
        <Text style={styles.groupTitle}>Consignee Details</Text>

        <View style={styles.section}>
          <Text style={styles.label}>
            Name <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, errors.consignee_name && styles.inputError]}
            placeholder="Consignee name"
            value={formData.consignee_name}
            onChangeText={(text) =>
              setFormData({ ...formData, consignee_name: text })
            }
          />
          {errors.consignee_name && (
            <Text style={styles.error}>{errors.consignee_name}</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>
            Phone <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, errors.consignee_phone && styles.inputError]}
            placeholder="10-digit phone number"
            keyboardType="phone-pad"
            value={formData.consignee_phone}
            onChangeText={(text) =>
              setFormData({ ...formData, consignee_phone: text })
            }
          />
          {errors.consignee_phone && (
            <Text style={styles.error}>{errors.consignee_phone}</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Address</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Consignee address"
            multiline
            numberOfLines={2}
            value={formData.consignee_address}
            onChangeText={(text) =>
              setFormData({ ...formData, consignee_address: text })
            }
          />
        </View>
      </View>

      {/* Goods & Freight Section */}
      <View style={styles.sectionGroup}>
        <Text style={styles.groupTitle}>Goods & Freight Details</Text>

        <View style={styles.section}>
          <Text style={styles.label}>
            Goods Description <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, errors.goods_description && styles.inputError]}
            placeholder="Describe the goods"
            multiline
            numberOfLines={3}
            value={formData.goods_description}
            onChangeText={(text) =>
              setFormData({ ...formData, goods_description: text })
            }
          />
          {errors.goods_description && (
            <Text style={styles.error}>{errors.goods_description}</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>
            Weight (kg) <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, errors.weight_kg && styles.inputError]}
            placeholder="0.00"
            keyboardType="decimal-pad"
            value={formData.weight_kg}
            onChangeText={(text) =>
              setFormData({ ...formData, weight_kg: text })
            }
          />
          {errors.weight_kg && <Text style={styles.error}>{errors.weight_kg}</Text>}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>
            Freight Amount (₹) <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, errors.freight_amount && styles.inputError]}
            placeholder="0.00"
            keyboardType="decimal-pad"
            value={formData.freight_amount}
            onChangeText={(text) =>
              setFormData({ ...formData, freight_amount: text })
            }
          />
          {errors.freight_amount && (
            <Text style={styles.error}>{errors.freight_amount}</Text>
          )}
        </View>

        <View style={styles.checkboxSection}>
          <TouchableOpacity
            style={styles.checkbox}
            onPress={() =>
              setFormData({
                ...formData,
                gst_applicable: !formData.gst_applicable,
              })
            }
          >
            <View
              style={[
                styles.checkboxBox,
                formData.gst_applicable && styles.checkboxBoxChecked,
              ]}
            >
              {formData.gst_applicable && (
                <Text style={styles.checkboxTick}>✓</Text>
              )}
            </View>
            <Text style={styles.checkboxLabel}>GST Applicable (18%)</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonGroup}>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.submitButton} onPress={handleAddLR}>
          <Text style={styles.buttonText}>Create LR</Text>
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
    borderLeftColor: '#3498DB',
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
  checkboxSection: {
    marginTop: 8,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  checkboxBox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#3498DB',
    borderRadius: 4,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxBoxChecked: {
    backgroundColor: '#3498DB',
  },
  checkboxTick: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#34495E',
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

export default LorryReceiptForm;
