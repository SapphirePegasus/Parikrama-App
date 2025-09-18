import { supabase } from "@/lib/supabase";
import * as Application from "expo-application";
import * as Device from "expo-device";
import { useEffect } from "react";
//import { Alert } from "react-native";

export default function DeviceAnalytics() {
  async function collectDeviceAnalytics() {
    try {
      const payload = {
        brand: Device.brand ?? null,
        deviceName: Device.deviceName ?? null,
        manufacturer: Device.manufacturer ?? null,
        modelName: Device.modelName ?? null,
        designName: Device.designName ?? null,
        productName: Device.productName ?? null,
        deviceYearClass: Device.deviceYearClass ?? null,
        supportedCpuArchitectures: Device.supportedCpuArchitectures ?? null,
        osBuildId: Device.osBuildId ?? null,
        osInternalBuildId: Device.osInternalBuildId ?? null,
        osName: Device.osName ?? null,
        osVersion: Device.osVersion ?? null,
        platformApiLevel: Device.platformApiLevel ?? null,
        totalMemory: Device.totalMemory ?? null,
        isDevice: Device.isDevice ?? null,
        deviceType: Device.deviceType ?? null,
        appId: Application.applicationId ?? null,
        appName: Application.applicationName ?? null,
        appVersion: Application.nativeApplicationVersion ?? null,
        appBuildVersion: Application.nativeBuildVersion ?? null,
        timestamp: new Date().toISOString(),
      };

      // Save as JSON in Supabase
      const { error } = await supabase
        .from("ParikramaUserAudit")
        .insert([{ device_details: payload }]);

      if (error) {
        console.error("An error occured:", error);
        // Optional: remove Alert in background mode
        // Alert.alert("Error", "Could not save system data.");
      } else {
        console.log("Made by Prittam");
      }
    } catch (err) {
      console.error("Error:", err);
    }
  }

  useEffect(() => {
    collectDeviceAnalytics();
  }, []);

  return null; // nothing visible on screen
}

/*import { supabase } from "@/lib/supabase";
import * as Application from "expo-application";
import * as Device from "expo-device";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function DeviceAnalytics() {
  const [visible, setVisible] = useState(true);
  const [loading, setLoading] = useState(false);

  async function handleAgree() {
    setLoading(true);
    try {
      // Collect device + app info
      const payload = {
        deviceName: Device.deviceName ?? null,
        modelName: Device.modelName ?? null,
        brand: Device.brand ?? null,
        osName: Device.osName ?? null,
        osVersion: Device.osVersion ?? null,
        isDevice: Device.isDevice ?? null,
        totalMemory: Device.totalMemory ?? null,
        appName: Application.applicationName ?? null,
        appVersion: Application.nativeApplicationVersion ?? null,
        appBuildVersion: Application.nativeBuildVersion ?? null,
        timestamp: new Date().toISOString(),
      };

      // Save as JSON in Supabase
      const { error } = await supabase
        .from("ParikramaUserAudit")
        .insert([{ device_details: payload }]);

      if (error) {
        console.error("Supabase insert error:", error);
        Alert.alert("Error", "Could not save system data.");
      } else {
        console.log("Saved system data!");
        setVisible(false);
      }
    } catch (err) {
      console.error("handleAgree error:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>Share Analytics Data</Text>
          <Text style={styles.body}>
            Please note, this is a pre-alpha build, so user analytics data will
            be shared with the developer by default.{"\n"}
            {"\n"}This app is for internal testing only and shall not be used
            for distributions.{"\n"}
            {"\n"}Thank you for using our app.
          </Text>

          <TouchableOpacity
            style={styles.button}
            onPress={handleAgree}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>Agree & Continue</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.note}>Parikrama - Pandel Hopping Made Easy</Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    elevation: 5,
  },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  body: { fontSize: 14, marginBottom: 20, color: "#333" },
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  note: { fontSize: 12, color: "#666", marginTop: 15, textAlign: "center" },
});*/
