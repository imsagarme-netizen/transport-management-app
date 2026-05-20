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
import { useTripStore } from '../store/tripStore';
import { useVehicleStore } from '../store/vehicleStore';
import { useDriverStore } from '../store/driverStore';
import { generateTripId } from '../utils/tripHelpers';

interface TripFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

/**
 * Trip Form Component
 * Used for adding and editing trips
 */
const TripForm: React.FC<TripFormProps> = ({ onSuccess, onCancel }) => {
  const { trips, addTrip } = useTripStore();
  const { vehicles } = useVehicleStore();
  const { drivers } = useDriverStore();

  const [formData, setFormData] = useState({
    trip_id: generateTripId(trips.length),
    vehicle_id: vehicles.length > 0 ? vehicles[0].id : '',
    driver_id: drivers.length > 0 ? drivers[0].id : '',
    origin: '',
    destination: '',
    origin_lat: '',
    origin_lon: '',
    destination_lat: '',
    destination_lon: '',
    estimated_distance_km: '',
    estimated_duration_hours: '',
    status: 'planned' as const,
    start_time: new Date().toISOString().split('T')[0],
    end_time: '',
    fuel_consumed_litres: '',
    fuel_cost: '',
    toll_paid: '',
    other_expenses: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.vehicle_id) newErrors.vehicle_id = 'Vehicle is required';
    if (!formData.driver_id) newErrors.driver_id = 'Driver is required';
    if (!formData.origin.trim()) newErrors.origin = 'Origin is required';
    if (!formData.destination.trim()) newErrors.destination = 'Destination is required';
    if (!formData.estimated_distance_km || parseFloat(formData.estimated_distance_km) <= 0) {
      newErrors.estimated_distance_km = 'Distance must be greater than 0';
    }
    if (!formData.estimated_duration_hours || parseFloat(formData.estimated_duration_hours) <= 0) {
      newErrors.estimated_duration_hours = 'Duration must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddTrip = () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fill all required fields correctly');
      return;
    }

    try {
      const newTrip = addTrip({
        trip_id: formData.trip_id,
        vehicle_id: formData.vehicle_id,
        driver_id: formData.driver_id,
        origin: formData.origin,
        destination: formData.destination,
        origin_lat: parseFloat(formData.origin_lat) || 0,
        origin_lon: parseFloat(formData.origin_lon) || 0,
        destination_lat: parseFloat(formData.destination_lat) || 0,
        destination_lon: parseFloat(formData.destination_lon) || 0,
        estimated_distance_km: parseFloat(formData.estimated_distance_km),
        estimated_duration_hours: parseFloat(formData.estimated_duration_hours),
        status: 'planned',
        start_time: formData.start_time,
        end_time: formData.end_time,
        fuel_consumed_litres: parseFloat(formData.fuel_consumed_litres) || 0,
        fuel_cost: parseFloat(formData.fuel_cost) || 0,
        toll_paid: parseFloat(formData.toll_paid) || 0,
        other_expenses: parseFloat(formData.other_expenses) || 0,
        notes: formData.notes,
      });

      Alert.alert('Success', `Trip ${newTrip.trip_id} created successfully`);
      onSuccess?.();
    } catch (error) {
      Alert.alert('Error', 'Failed to create trip');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Create Trip</Text>

      {/* Trip ID (Auto-generated, Read-only) */}
      <View style={styles.section}>
        <Text style={styles.label}>Trip ID (Auto-generated)</Text>
        <TextInput
          style={[styles.input, styles.readOnly]}
          value={formData.trip_id}
          editable={false}
        />
      </View>

      {/* Vehicle & Driver Selection */}
      <View style={styles.sectionGroup}>
        <Text style={styles.groupTitle}>Vehicle & Driver</Text>

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
                  label={`${vehicle.registration_number} (${vehicle.vehicle_type})`}
                  value={vehicle.id}
                />
              ))}
            </Picker>
          </View>
          {errors.vehicle_id && <Text style={styles.error}>{errors.vehicle_id}</Text>}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>
            Driver <Text style={styles.required}>*</Text>
          </Text>
          <View style={[styles.picker, errors.driver_id && styles.pickerError]}>
            <Picker
              selectedValue={formData.driver_id}
              onValueChange={(itemValue) =>
                setFormData({ ...formData, driver_id: itemValue })
              }
            >
              <Picker.Item label="Select a driver" value="" />
              {drivers.map((driver) => (
                <Picker.Item
                  key={driver.id}
                  label={`${driver.name} (${driver.license_number})`}
                  value={driver.id}
                />
              ))}
            </Picker>
          </View>
          {errors.driver_id && <Text style={styles.error}>{errors.driver_id}</Text>}
        </View>
      </View>

      {/* Route Details */}
      <View style={styles.sectionGroup}>
        <Text style={styles.groupTitle}>Route Details</Text>

        <View style={styles.section}>
          <Text style={styles.label}>
            Origin <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, errors.origin && styles.inputError]}
            placeholder="Starting location"
            value={formData.origin}
            onChangeText={(text) =>
              setFormData({ ...formData, origin: text })
            }
          />
          {errors.origin && <Text style={styles.error}>{errors.origin}</Text>}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>
            Destination <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, errors.destination && styles.inputError]}
            placeholder="Ending location"
            value={formData.destination}
            onChangeText={(text) =>
              setFormData({ ...formData, destination: text })
            }
          />
          {errors.destination && <Text style={styles.error}>{errors.destination}</Text>}
        </View>

        <View style={styles.twoColumnRow}>
          <View style={[styles.section, styles.twoColumn]}>
            <Text style={styles.label}>Origin Latitude</Text>
            <TextInput
              style={styles.input}
              placeholder="0.0000"
              keyboardType="decimal-pad"
              value={formData.origin_lat}
              onChangeText={(text) =>
                setFormData({ ...formData, origin_lat: text })
              }
            />
          </View>
          <View style={[styles.section, styles.twoColumn]}>
            <Text style={styles.label}>Origin Longitude</Text>
            <TextInput
              style={styles.input}
              placeholder="0.0000"
              keyboardType="decimal-pad"
              value={formData.origin_lon}
              onChangeText={(text) =>
                setFormData({ ...formData, origin_lon: text })
              }
            />
          </View>
        </View>

        <View style={styles.twoColumnRow}>
          <View style={[styles.section, styles.twoColumn]}>
            <Text style={styles.label}>Dest. Latitude</Text>
            <TextInput
              style={styles.input}
              placeholder="0.0000"
              keyboardType="decimal-pad"
              value={formData.destination_lat}
              onChangeText={(text) =>
                setFormData({ ...formData, destination_lat: text })
              }
            />
          </View>
          <View style={[styles.section, styles.twoColumn]}>
            <Text style={styles.label}>Dest. Longitude</Text>
            <TextInput
              style={styles.input}
              placeholder="0.0000"
              keyboardType="decimal-pad"
              value={formData.destination_lon}
              onChangeText={(text) =>
                setFormData({ ...formData, destination_lon: text })
              }
            />
          </View>
        </View>
      </View>

      {/* Trip Estimates */}
      <View style={styles.sectionGroup}>
        <Text style={styles.groupTitle}>Trip Estimates</Text>

        <View style={styles.twoColumnRow}>
          <View style={[styles.section, styles.twoColumn]}>
            <Text style={styles.label}>
              Distance (km) <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, errors.estimated_distance_km && styles.inputError]}
              placeholder="0.00"
              keyboardType="decimal-pad"
              value={formData.estimated_distance_km}
              onChangeText={(text) =>
                setFormData({ ...formData, estimated_distance_km: text })
              }
            />
            {errors.estimated_distance_km && (
              <Text style={styles.error}>{errors.estimated_distance_km}</Text>
            )}
          </View>
          <View style={[styles.section, styles.twoColumn]}>
            <Text style={styles.label}>
              Duration (hrs) <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, errors.estimated_duration_hours && styles.inputError]}
              placeholder="0.00"
              keyboardType="decimal-pad"
              value={formData.estimated_duration_hours}
              onChangeText={(text) =>
                setFormData({ ...formData, estimated_duration_hours: text })
              }
            />
            {errors.estimated_duration_hours && (
              <Text style={styles.error}>{errors.estimated_duration_hours}</Text>
            )}
          </View>
        </View>

        <View style={styles.twoColumnRow}>
          <View style={[styles.section, styles.twoColumn]}>
            <Text style={styles.label}>Start Date</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              value={formData.start_time}
              onChangeText={(text) =>
                setFormData({ ...formData, start_time: text })
              }
            />
          </View>
          <View style={[styles.section, styles.twoColumn]}>
            <Text style={styles.label}>End Date</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              value={formData.end_time}
              onChangeText={(text) =>
                setFormData({ ...formData, end_time: text })
              }
            />
          </View>
        </View>
      </View>

      {/* Expenses */}
      <View style={styles.sectionGroup}>
        <Text style={styles.groupTitle}>Expenses</Text>

        <View style={styles.twoColumnRow}>
          <View style={[styles.section, styles.twoColumn]}>
            <Text style={styles.label}>Fuel (litres)</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              keyboardType="decimal-pad"
              value={formData.fuel_consumed_litres}
              onChangeText={(text) =>
                setFormData({ ...formData, fuel_consumed_litres: text })
              }
            />
          </View>
          <View style={[styles.section, styles.twoColumn]}>
            <Text style={styles.label}>Fuel Cost (₹)</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              keyboardType="decimal-pad"
              value={formData.fuel_cost}
              onChangeText={(text) =>
                setFormData({ ...formData, fuel_cost: text })
              }
            />
          </View>
        </View>

        <View style={styles.twoColumnRow}>
          <View style={[styles.section, styles.twoColumn]}>
            <Text style={styles.label}>Toll (₹)</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              keyboardType="decimal-pad"
              value={formData.toll_paid}
              onChangeText={(text) =>
                setFormData({ ...formData, toll_paid: text })
              }
            />
          </View>
          <View style={[styles.section, styles.twoColumn]}>
            <Text style={styles.label}>Other (₹)</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              keyboardType="decimal-pad"
              value={formData.other_expenses}
              onChangeText={(text) =>
                setFormData({ ...formData, other_expenses: text })
              }
            />
          </View>
        </View>
      </View>

      {/* Notes */}
      <View style={styles.section}>
        <Text style={styles.label}>Notes</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Additional trip notes"
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
        <TouchableOpacity style={styles.submitButton} onPress={handleAddTrip}>
          <Text style={styles.buttonText}>Create Trip</Text>
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
  twoColumnRow: {
    flexDirection: 'row',
    gap: 12,
  },
  twoColumn: {
    flex: 1,
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

export default TripForm;
