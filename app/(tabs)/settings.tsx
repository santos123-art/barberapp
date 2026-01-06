import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { ArrowLeft, Bell, Moon, Lock, ChevronRight, HelpCircle } from 'lucide-react-native';

export default function SettingsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true); // Default true for this dark theme app

  const handlePasswordChange = () => {
    Alert.alert('Alterar Senha', 'Funcionalidade de alterar senha enviará um email de redefinição.');
  };

  const handleHelp = () => {
    Alert.alert('Ajuda', 'Entre em contato com suporte@barber.com');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Configurações</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferências</Text>

          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconContainer, { backgroundColor: 'rgba(50, 215, 75, 0.1)' }]}>
                <Bell size={20} color={Colors.success} />
              </View>
              <Text style={styles.rowLabel}>Notificações</Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: '#767577', true: Colors.primary }}
              thumbColor={notifications ? '#fff' : '#f4f3f4'}
            />
          </View>

          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconContainer, { backgroundColor: 'rgba(100, 100, 255, 0.1)' }]}>
                <Moon size={20} color="#6495ED" />
              </View>
              <Text style={styles.rowLabel}>Modo Escuro</Text>
            </View>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: '#767577', true: Colors.primary }}
              thumbColor={darkMode ? '#fff' : '#f4f3f4'}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Conta</Text>

          <TouchableOpacity style={styles.row} onPress={handlePasswordChange}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconContainer, { backgroundColor: 'rgba(255, 165, 0, 0.1)' }]}>
                <Lock size={20} color="orange" />
              </View>
              <Text style={styles.rowLabel}>Alterar Senha</Text>
            </View>
            <ChevronRight size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Outros</Text>

          <TouchableOpacity style={styles.row} onPress={handleHelp}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconContainer, { backgroundColor: 'rgba(255, 255, 255, 0.1)' }]}>
                <HelpCircle size={20} color={Colors.text} />
              </View>
              <Text style={styles.rowLabel}>Ajuda e Suporte</Text>
            </View>
            <ChevronRight size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <Text style={styles.version}>Versão 1.0.0</Text>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 60,
    backgroundColor: Colors.surface,
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 30,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginLeft: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceLight,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: {
    fontSize: 16,
    color: Colors.text,
  },
  version: {
    textAlign: 'center',
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: 20,
  },
});
