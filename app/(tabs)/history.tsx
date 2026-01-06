import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { Calendar, Clock, Scissors, ArrowLeft } from 'lucide-react-native';

interface Appointment {
  id: string;
  date: string;
  time: string;
  status: string;
  services: { name: string; price: string };
  barbers: { name: string };
}

export default function HistoryScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAppointments = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          services (name, price),
          barbers (name)
        `)
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .order('time', { ascending: false });

      if (error) throw error;
      setAppointments(data || []);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAppointments();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return Colors.success;
      case 'pending': return 'orange';
      case 'cancelled': return Colors.error;
      default: return Colors.textSecondary;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmado';
      case 'pending': return 'Pendente';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  const renderItem = ({ item }: { item: Appointment }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.serviceName}>{item.services?.name || 'Serviço'}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {getStatusLabel(item.status)}
          </Text>
        </View>
      </View>

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Calendar size={16} color={Colors.textSecondary} />
          <Text style={styles.detailText}>{new Date(item.date).toLocaleDateString('pt-BR')}</Text>
        </View>
        <View style={styles.detailRow}>
          <Clock size={16} color={Colors.textSecondary} />
          <Text style={styles.detailText}>{item.time.substring(0, 5)}</Text>
        </View>
        <View style={styles.detailRow}>
          <Scissors size={16} color={Colors.textSecondary} />
          <Text style={styles.detailText}>{item.barbers?.name || 'Barbeiro'}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Histórico</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading && !refreshing ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={appointments}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Nenhum agendamento encontrado.</Text>
            </View>
          }
        />
      )}
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
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 20,
    gap: 16,
  },
  card: {
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  details: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: 16,
  },
});
