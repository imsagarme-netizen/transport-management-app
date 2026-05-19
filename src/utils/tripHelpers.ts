/**
 * Trip Management Helper Functions
 * Utilities for trip operations, validations, and formatting
 */

/**
 * Generate unique Trip ID (TRIP-00001, TRIP-00002, etc.)
 * @param tripCount - Current count of trips created
 * @returns Formatted trip number
 */
export const generateTripId = (tripCount: number): string => {
  const paddedNumber = String(tripCount + 1).padStart(5, '0');
  return `TRIP-${paddedNumber}`;
};

/**
 * Calculate distance using Haversine formula
 * @param lat1 - Origin latitude
 * @param lon1 - Origin longitude
 * @param lat2 - Destination latitude
 * @param lon2 - Destination longitude
 * @returns Distance in kilometers
 */
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 100) / 100;
};

/**
 * Calculate trip duration in hours
 * @param startDate - Start date
 * @param endDate - End date
 * @returns Duration in hours
 */
export const calculateTripDuration = (startDate: string, endDate: string): number => {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  const diffMs = end - start;
  const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));
  return Math.max(diffHours, 0);
};

/**
 * Calculate average speed
 * @param distanceKm - Distance in kilometers
 * @param durationHours - Duration in hours
 * @returns Average speed in km/h
 */
export const calculateAverageSpeed = (distanceKm: number, durationHours: number): number => {
  if (durationHours === 0) return 0;
  return Math.round((distanceKm / durationHours) * 100) / 100;
};

/**
 * Calculate fuel efficiency (mileage)
 * @param distanceKm - Distance in kilometers
 * @param fuelLiters - Fuel consumed in liters
 * @returns Mileage in km/liter
 */
export const calculateFuelEfficiency = (distanceKm: number, fuelLiters: number): number => {
  if (fuelLiters === 0) return 0;
  return Math.round((distanceKm / fuelLiters) * 100) / 100;
};

/**
 * Validate trip dates
 * @param startDate - Start date
 * @param endDate - End date
 * @returns true if dates are valid
 */
export const validateTripDates = (startDate: string, endDate: string): boolean => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return start < end && !isNaN(start.getTime()) && !isNaN(end.getTime());
};

/**
 * Get trip status color
 * @param status - Trip status
 * @returns Color code
 */
export const getTripStatusColor = (
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled'
): string => {
  const statusColors: Record<string, string> = {
    planned: '#F39C12', // Amber
    in_progress: '#3498DB', // Blue
    completed: '#27AE60', // Green
    cancelled: '#E74C3C', // Red
  };
  return statusColors[status] || '#95A5A6';
};

/**
 * Get trip status label
 * @param status - Trip status
 * @returns Human-readable status label
 */
export const getTripStatusLabel = (
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled'
): string => {
  const statusLabels: Record<string, string> = {
    planned: 'Planned',
    in_progress: 'In Progress',
    completed: 'Completed',
    cancelled: 'Cancelled',
  };
  return statusLabels[status] || 'Unknown';
};

/**
 * Get trip status icon
 * @param status - Trip status
 * @returns Emoji icon
 */
export const getTripStatusIcon = (
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled'
): string => {
  const icons: Record<string, string> = {
    planned: '📅',
    in_progress: '🚛',
    completed: '✅',
    cancelled: '❌',
  };
  return icons[status] || '📦';
};

/**
 * Check if trip is overdue
 * @param endDate - Expected end date
 * @returns true if trip is overdue
 */
export const isTripOverdue = (endDate: string): boolean => {
  const end = new Date(endDate).getTime();
  const now = new Date().getTime();
  return end < now;
};

/**
 * Calculate trip completion percentage
 * @param startDate - Start date
 * @param endDate - Expected end date
 * @returns Completion percentage (0-100)
 */
export const calculateTripCompletion = (startDate: string, endDate: string): number => {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  const now = new Date().getTime();

  if (now < start) return 0;
  if (now > end) return 100;

  const total = end - start;
  const elapsed = now - start;
  return Math.round((elapsed / total) * 100);
};

/**
 * Format trip time range for display
 * @param startDate - Start date
 * @param endDate - End date
 * @returns Formatted time range
 */
export const formatTripTimeRange = (startDate: string, endDate: string): string => {
  const start = new Date(startDate).toLocaleDateString('en-IN');
  const end = new Date(endDate).toLocaleDateString('en-IN');
  return `${start} to ${end}`;
};

/**
 * Calculate trip profit
 * @param revenue - Total revenue (from LRs)
 * @param expenses - Total expenses (fuel, toll, allowance, etc.)
 * @returns Profit amount
 */
export const calculateTripProfit = (revenue: number, expenses: number): number => {
  return Math.round((revenue - expenses) * 100) / 100;
};

/**
 * Calculate profit margin percentage
 * @param profit - Profit amount
 * @param revenue - Total revenue
 * @returns Profit margin percentage
 */
export const calculateProfitMargin = (profit: number, revenue: number): number => {
  if (revenue === 0) return 0;
  return Math.round((profit / revenue) * 100 * 100) / 100;
};

/**
 * Format trip summary for display
 * @param tripNumber - Trip number
 * @param origin - Origin
 * @param destination - Destination
 * @param distanceKm - Distance in km
 * @returns Formatted summary string
 */
export const formatTripSummary = (
  tripNumber: string,
  origin: string,
  destination: string,
  distanceKm: number
): string => {
  return `${tripNumber} - ${origin} to ${destination} (${distanceKm}km)`;
};

/**
 * Get trip days remaining
 * @param endDate - Expected end date
 * @returns Days remaining (positive) or days overdue (negative)
 */
export const getTripDaysRemaining = (endDate: string): number => {
  const end = new Date(endDate);
  const now = new Date();
  const diffMs = end.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return diffDays;
};

/**
 * Format trip consumption summary
 * @param fuelLiters - Fuel consumed in liters
 * @param tollCharges - Toll charges
 * @param driverAllowance - Driver allowance
 * @returns Formatted consumption details
 */
export const formatTripConsumptionSummary = (
  fuelLiters: number,
  tollCharges: number,
  driverAllowance: number
): string => {
  return `Fuel: ${fuelLiters}L | Toll: ₹${tollCharges} | Allowance: ₹${driverAllowance}`;
};
