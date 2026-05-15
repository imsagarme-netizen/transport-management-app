import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Switch,
} from 'react-native';

export interface VehicleFormData {
  name: string;
  type: 'Truck' | 'Tempo' | 'Pickup';
  registration_number: string;
  owner_name: string;
  insurance_expiry?: string;
  puc_expiry?: string;
  next_service_km?: string;
  current_km?: string;
  status: 'Active' | 'In Trip' | 'Under Repair';
}

interface VehicleFormProps {
  onSubmit: (data: VehicleFormData) => void;
  onCancel: () => void;
  initialData?: VehicleFormData;
}

export const VehicleForm: React.FC<VehicleFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
}) => {
  const [formData, setFormData] = useState<VehicleFormData>(
    initialData || {
      name: '',
      type: 'Truck',
      registration_number: '',
      owner_name: '',
      insurance_expiry: '',
      puc_expiry: '',
      next_service_km: '',
      current_km: '',
      status: 'Active',
    }
  );

  const handleChange = (field: keyof VehicleFormData, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.registration_number || !formData.owner_name) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    onSubmit(formData);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{initialData ? 'Edit Vehicle' : 'Add Vehicle'}</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Vehicle Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Truck 1, Tempo-01"
          value={formData.name}
          onChangeText={(value) => handleChange('name', value)}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Vehicle Type *</Text>
        <View style={styles.pickerContainer}>
          {['Truck', 'Tempo', 'Pickup'].map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.pickerOption,
                formData.type === type && styles.pickerOptionActive,
              ]}
              onPress={() => handleChange('type', type as any)}
            >
              <Text
                style={[
                  styles.pickerOptionText,
                  formData.type === type && styles.pickerOptionTextActive,
                ]}
              >
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Registration Number *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., MH 01 AB 1234"
          value={formData.registration_number}
          onChangeText={(value) => handleChange('registration_number', value.toUpperCase())}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Owner Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="Owner name"
          value={formData.owner_name}
          onChangeText={(value) => handleChange('owner_name', value)}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Insurance Expiry (YYYY-MM-DD)</Text>
        <TextInput
          style={styles.input}
          placeholder="2024-12-31"
          value={formData.insurance_expiry}
          onChangeText={(value) => handleChange('insurance_expiry', value)}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>PUC Expiry (YYYY-MM-DD)</Text>
        <TextInput
          style={styles.input}
          placeholder="2024-06-30"
          value={formData.puc_expiry}
          onChangeText={(value) => handleChange('puc_expiry', value)}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Next Service KM</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., 50000"
          keyboardType="numeric"
          value={formData.next_service_km}
          onChangeText={(value) => handleChange('next_service_km', value)}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Current KM Reading</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., 45000"
          keyboardType="numeric"
          value={formData.current_km}
          onChangeText={(value) => handleChange('current_km', value)}
        />
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>
            {initialData ? 'Update' : 'Add'} Vehicle
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#555',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: '#f9f9f9',
  },
  pickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  pickerOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    alignItems: 'center',
  },
  pickerOptionActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  pickerOptionText: {
    fontSize: 14,
    color: '#555',
  },
  pickerOptionTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
    marginBottom: 20,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
  },
  submitButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
