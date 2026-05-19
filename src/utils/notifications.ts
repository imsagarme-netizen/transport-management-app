import * as Notifications from 'expo-notifications';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const initializeNotifications = async () => {
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      console.log('Notification permissions not granted');
      return false;
    }
    return true;
  } catch (error) {
    console.error('Failed to initialize notifications:', error);
    return false;
  }
};

export const sendLocalNotification = async (
  title: string,
  body: string,
  delay: number = 5
) => {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
        badge: 1,
      },
      trigger: {
        seconds: delay,
      },
    });
  } catch (error) {
    console.error('Failed to send notification:', error);
  }
};

export const scheduleInsuranceExpiryAlert = async (
  vehicleName: string,
  expiryDate: string
) => {
  try {
    // Schedule 30 days before
    const date30Before = new Date(expiryDate);
    date30Before.setDate(date30Before.getDate() - 30);

    if (date30Before > new Date()) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🚨 Insurance Expiry Alert',
          body: `${vehicleName}'s insurance expires in 30 days`,
          sound: true,
          badge: 1,
        },
        trigger: {
          date: date30Before,
        },
      });
    }

    // Schedule on expiry date
    const expiryDateObj = new Date(expiryDate);
    if (expiryDateObj > new Date()) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🔴 Insurance Expired',
          body: `${vehicleName}'s insurance has expired. Renew immediately!`,
          sound: true,
          badge: 1,
        },
        trigger: {
          date: expiryDateObj,
        },
      });
    }
  } catch (error) {
    console.error('Failed to schedule insurance alert:', error);
  }
};

export const schedulePUCExpiryAlert = async (
  vehicleName: string,
  expiryDate: string
) => {
  try {
    // Schedule 30 days before
    const date30Before = new Date(expiryDate);
    date30Before.setDate(date30Before.getDate() - 30);

    if (date30Before > new Date()) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🚨 PUC Expiry Alert',
          body: `${vehicleName}'s PUC expires in 30 days`,
          sound: true,
          badge: 1,
        },
        trigger: {
          date: date30Before,
        },
      });
    }

    // Schedule on expiry date
    const expiryDateObj = new Date(expiryDate);
    if (expiryDateObj > new Date()) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🔴 PUC Expired',
          body: `${vehicleName}'s PUC has expired. Get it renewed!`,
          sound: true,
          badge: 1,
        },
        trigger: {
          date: expiryDateObj,
        },
      });
    }
  } catch (error) {
    console.error('Failed to schedule PUC alert:', error);
  }
};

export const scheduleServiceDueAlert = async (
  vehicleName: string,
  nextServiceKm: number,
  currentKm: number
) => {
  try {
    const kmRemaining = nextServiceKm - currentKm;
    if (kmRemaining <= 500 && kmRemaining > 0) {
      await sendLocalNotification(
        '⚙️ Service Due Soon',
        `${vehicleName} is due for service in ${kmRemaining} km`
      );
    } else if (kmRemaining <= 0) {
      await sendLocalNotification(
        '🔴 Service Overdue',
        `${vehicleName} is overdue for service!`
      );
    }
  } catch (error) {
    console.error('Failed to schedule service alert:', error);
  }
};

export const scheduleLicenseExpiryAlert = async (
  driverName: string,
  expiryDate: string
) => {
  try {
    // Schedule 30 days before
    const date30Before = new Date(expiryDate);
    date30Before.setDate(date30Before.getDate() - 30);

    if (date30Before > new Date()) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🚨 License Expiry Alert',
          body: `${driverName}'s license expires in 30 days`,
          sound: true,
          badge: 1,
        },
        trigger: {
          date: date30Before,
        },
      });
    }

    // Schedule on expiry date
    const expiryDateObj = new Date(expiryDate);
    if (expiryDateObj > new Date()) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🔴 License Expired',
          body: `${driverName}'s license has expired!`,
          sound: true,
          badge: 1,
        },
        trigger: {
          date: expiryDateObj,
        },
      });
    }
  } catch (error) {
    console.error('Failed to schedule license alert:', error);
  }
};

export const scheduleEMIDueAlert = async (
  vehicleName: string,
  dueDate: string,
  emiAmount: number
) => {
  try {
    // Schedule 3 days before
    const date3Before = new Date(dueDate);
    date3Before.setDate(date3Before.getDate() - 3);

    if (date3Before > new Date()) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '💰 EMI Due Soon',
          body: `${vehicleName} EMI of ₹${emiAmount} is due in 3 days`,
          sound: true,
          badge: 1,
        },
        trigger: {
          date: date3Before,
        },
      });
    }
  } catch (error) {
    console.error('Failed to schedule EMI alert:', error);
  }
};

export const scheduleLowStockAlert = async (
  itemName: string,
  currentQty: number,
  reorderLevel: number
) => {
  try {
    if (currentQty <= reorderLevel) {
      await sendLocalNotification(
        '📦 Low Stock Alert',
        `${itemName} is running low (${currentQty} remaining)`
      );
    }
  } catch (error) {
    console.error('Failed to schedule stock alert:', error);
  }
};

export const scheduleInvoiceOverdueAlert = async (
  invoiceNo: string,
  dueDate: string,
  amount: number
) => {
  try {
    const dueDateObj = new Date(dueDate);
    if (dueDateObj < new Date()) {
      await sendLocalNotification(
        '💳 Invoice Overdue',
        `Invoice ${invoiceNo} for ₹${amount} is overdue!`
      );
    }
  } catch (error) {
    console.error('Failed to schedule invoice alert:', error);
  }
};

export const clearAllNotifications = async () => {
  try {
    await Notifications.dismissAllNotificationsAsync();
  } catch (error) {
    console.error('Failed to clear notifications:', error);
  }
};
