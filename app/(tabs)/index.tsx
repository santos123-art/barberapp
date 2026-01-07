import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, FlatList, RefreshControl, ActivityIndicator } from 'react-native';
import { Colors } from '../../constants/Colors';
import { useAuth } from '../../context/AuthContext';
import { Calendar, Clock, Star, Scissors, User, AlertCircle } from 'lucide-react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { supabase } from '../../lib/supabase';

// Interfaces
interface Service {
  id: string;
  name: string;
  price: string;
  duration: string;
  icon: string;
}

interface Barber {
  id: string;
  name: string;
  image: string;
  rating: number;
}

interface Appointment {
  id: string;
  date: string;
  time: string;
  status: string;
  services: Service;
  barbers: Barber;
}

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();

  const [services, setServices] = useState<Service[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [nextAppointment, setNextAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      // 1. Fetch Services
      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select('*')
        .order('price', { ascending: true });

      if (servicesError) throw servicesError;
      setServices(servicesData || []);

      // 2. Fetch Barbers
      const { data: barbersData, error: barbersError } = await supabase
        .from('barbers')
        .select('*');

      if (barbersError) throw barbersError;
      setBarbers(barbersData || []);

      // 3. Fetch Next Appointment
      if (user) {
        const today = new Date().toISOString().split('T')[0];
        const { data: appointmentData, error: appointmentError } = await supabase
          .from('appointments')
          .select(`
            *,
            services (*),
            barbers (*)
          `)
          .eq('user_id', user.id)
          .gte('date', today)
          .in('status', ['confirmed', 'pending'])
          .order('date', { ascending: true })
          .order('time', { ascending: true })
          .limit(1)
          .single();

        if (appointmentError && appointmentError.code !== 'PGRST116') {
          // PGRST116 is "no rows returned", which is fine
          console.error('Error fetching appointment:', appointmentError);
        }

        setNextAppointment(appointmentData);
      }

    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Reload data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [user])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };



  const renderServiceCard = ({ item }: { item: Service }) => (
    <TouchableOpacity style={styles.serviceCard} onPress={() => router.push('/(tabs)/book')}>
      <View style={styles.serviceIcon}>
        <Scissors size={24} color={Colors.primary} />
      </View>
      <Text style={styles.serviceName}>{item.name}</Text>
      <Text style={styles.servicePrice}>{item.price}</Text>
    </TouchableOpacity>
  );

  const renderBarberCard = ({ item }: { item: Barber }) => (
    <View style={styles.barberCard}>
      <Image
        source={{ uri: item.image || 'https://via.placeholder.com/150' }}
        style={styles.barberImage}
      />
      <Text style={styles.barberName}>{item.name}</Text>
      <View style={styles.ratingContainer}>
        <Star size={14} color={Colors.primary} fill={Colors.primary} />
        <Text style={styles.ratingText}>{item.rating}</Text>
      </View>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
      }
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Olá, {user?.name?.split(' ')[0] || 'Cliente'}</Text>
          <Text style={styles.subGreeting}>Hora de renovar o visual?</Text>
        </View>
        <TouchableOpacity style={styles.profileButton} onPress={() => router.push('/(tabs)/profile')}>
          <User size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Next Appointment Card */}
      {nextAppointment ? (
        <View style={styles.appointmentCard}>
          <View style={styles.appointmentHeader}>
            <Text style={styles.appointmentTitle}>Próximo Agendamento</Text>
            <View style={[
              styles.statusBadge,
              nextAppointment.status === 'pending' && { backgroundColor: 'rgba(255, 165, 0, 0.15)' }
            ]}>
              <Text style={[
                styles.statusText,
                nextAppointment.status === 'pending' && { color: 'orange' }
              ]}>
                {nextAppointment.status === 'confirmed' ? 'Confirmado' : 'Pendente'}
              </Text>
            </View>
          </View>
          <View style={styles.appointmentDetails}>
            <View style={styles.detailRow}>
              <Calendar size={18} color={Colors.textSecondary} />
              <Text style={styles.detailText}>
                {new Date(nextAppointment.date).toLocaleDateString('pt-BR')}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Clock size={18} color={Colors.textSecondary} />
              <Text style={styles.detailText}>
                {nextAppointment.time.substring(0, 5)} - {nextAppointment.services?.name}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <User size={18} color={Colors.textSecondary} />
              <Text style={styles.detailText}>Barbeiro: {nextAppointment.barbers?.name}</Text>
            </View>
          </View>
        </View>
      ) : (
        <View style={[styles.appointmentCard, { borderLeftColor: Colors.textSecondary, opacity: 0.8 }]}>
          <View style={styles.appointmentHeader}>
            <Text style={styles.appointmentTitle}>Nenhum agendamento</Text>
          </View>
          <View style={styles.emptyStateContainer}>
            <Text style={styles.emptyStateText}>Que tal agendar um corte hoje?</Text>
            <TouchableOpacity style={styles.bookNowButton} onPress={() => router.push('/(tabs)/book')}>
              <Text style={styles.bookNowText}>Agendar Agora</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Services Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Nossos Serviços</Text>
        <FlatList
          data={services}
          renderItem={renderServiceCard}
          keyExtractor={item => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      </View>

      {/* Barbers Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Nossos Profissionais</Text>
        <FlatList
          data={barbers}
          renderItem={renderBarberCard}
          keyExtractor={item => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
  },
  subGreeting: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  appointmentCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  appointmentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  statusBadge: {
    backgroundColor: 'rgba(50, 215, 75, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: Colors.success,
    fontSize: 12,
    fontWeight: '600',
  },
  appointmentDetails: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  detailText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  emptyStateContainer: {
    alignItems: 'flex-start',
    gap: 12,
  },
  emptyStateText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  bookNowButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  bookNowText: {
    color: '#000',
    fontWeight: '600',
    fontSize: 12,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  },
  listContent: {
    gap: 16,
  },
  serviceCard: {
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    width: 140,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  serviceIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  serviceName: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  servicePrice: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  barberCard: {
    alignItems: 'center',
    marginRight: 16,
  },
  barberImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  barberName: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
});
