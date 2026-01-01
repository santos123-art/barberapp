import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert, Pressable } from 'react-native';
import { Link } from 'expo-router';
import { Mail, Lock, Scissors } from 'lucide-react-native';
import { Colors } from '../../constants/Colors';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { useAuth } from '../../context/AuthContext';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }

    try {
      setLoading(true);
      await signIn(email, password);
    } catch (error) {
      // Error is handled in AuthContext
    } finally {
      setLoading(false);
    }
  };

  // Atalho para preencher dados de admin
  const fillAdmin = () => {
    setEmail('admin@barber.com');
    setPassword('tom123');
    Alert.alert(
      'Modo de Teste', 
      'Dados preenchidos! Se esta é sua primeira vez, clique em "Cadastre-se" para criar a conta com estes dados.'
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Pressable style={styles.logoContainer} onLongPress={fillAdmin}>
            <Scissors size={48} color={Colors.primary} />
          </Pressable>
          <Text style={styles.title}>BarberShop</Text>
          <Text style={styles.subtitle}>Agende seu estilo com facilidade</Text>
        </View>

        <View style={styles.form}>
          <Input
            label="E-mail"
            placeholder="seu@email.com"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            icon={<Mail size={20} color={Colors.textSecondary} />}
          />
          <Input
            label="Senha"
            placeholder="Sua senha"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            icon={<Lock size={20} color={Colors.textSecondary} />}
          />

          <Button 
            title="Entrar" 
            onPress={handleLogin} 
            style={styles.button} 
            loading={loading}
          />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Não tem uma conta? </Text>
            <Link href="/register" asChild>
              <Text style={styles.link}>Cadastre-se</Text>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  form: {
    width: '100%',
  },
  button: {
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    color: Colors.textSecondary,
  },
  link: {
    color: Colors.primary,
    fontWeight: 'bold',
  },
});
