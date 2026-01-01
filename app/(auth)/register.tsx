import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert, Pressable } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Mail, Lock, User, Phone, ArrowLeft } from 'lucide-react-native';
import { Colors } from '../../constants/Colors';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { useAuth } from '../../context/AuthContext';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios.');
      return;
    }

    try {
      setLoading(true);
      await signUp(name, email, password);
      
      Alert.alert(
        'Cadastro realizado com sucesso!',
        'Sua conta foi criada. Faça login para começar a agendar.',
        [
          { text: 'Ir para Login', onPress: () => router.replace('/login') }
        ]
      );
    } catch (error) {
      // Error handled in AuthContext
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Link href="/login" asChild>
            <Pressable style={{ marginBottom: 20 }}>
              <ArrowLeft size={24} color={Colors.text} />
            </Pressable>
          </Link>
          <Text style={styles.title}>Criar Conta</Text>
          <Text style={styles.subtitle}>Preencha seus dados para começar</Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Nome Completo"
            placeholder="Seu nome"
            value={name}
            onChangeText={setName}
            icon={<User size={20} color={Colors.textSecondary} />}
          />
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
            label="Telefone"
            placeholder="(00) 00000-0000"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            icon={<Phone size={20} color={Colors.textSecondary} />}
          />
          <Input
            label="Senha"
            placeholder="Crie uma senha segura"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            icon={<Lock size={20} color={Colors.textSecondary} />}
          />

          <Button 
            title="Cadastrar" 
            onPress={handleRegister} 
            style={styles.button} 
            loading={loading}
          />
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
    padding: 24,
  },
  header: {
    marginBottom: 32,
    marginTop: 20,
  },
  title: {
    fontSize: 28,
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
    marginTop: 16,
  },
});
