import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { DollarSign, ArrowLeft, Calendar } from 'lucide-react-native';

interface Payment {
  id: string;
  date: string;
  time: string;
  status: string;
  services: { name: string; price: string };
}

export default function PaymentsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [totalSpent, setTotalSpent] = useState('0,00');

  const fetchPayments = async () => {
    if (!user) return;

    try {
      // Fetch confirmed appointments as "payments"
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          id,
          date,
          time,
          status,
          services (name, price)
        `)
        .eq('user_id', user.id)
        .in('status', ['confirmed']) // Only confirmed appointments count as "sales/payments"
        .order('date', { ascending: false });

      if (error) throw error;

      const paymentsData = data || [];
      setPayments(paymentsData);

      // Calculate total
      let total = 0;
      paymentsData.forEach(p => {
        const priceString = p.services?.price || 'R$ 0,00';
        // Extract numeric value from "R$ 50,00"
        const numericPrice = parseFloat(priceString.replace('R$ ', '').replace('.', '').replace(',', '.'));
        if (!isNaN(numericPrice)) {
          total += numericPrice;
        }
      });
      setTotalSpent(total.toFixed(2).replace('.', ','));

    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPayments();
  };

  const renderItem = ({ item }: { item: Payment }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.serviceName}>{item.services?.name || 'Serviço'}</Text>
        <Text style={styles.price}>{item.services?.price}</Text>
      </View>

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Calendar size={14} color={Colors.textSecondary} />
          <Text style={styles.detailText}>
            {new Date(item.date).toLocaleDateString('pt-BR')} às {item.time.substring(0, 5)}
          </Text>
        </View>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>Pago</Text>
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
        <Text style={styles.title}>Pagamentos</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Total Gasto</Text>
        <Text style={styles.summaryValue}>R$ {totalSpent}</Text>
      </View>

      {loading && !refreshing ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={payments}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Nenhum pagamento registrado.</Text>
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
  summaryCard: {
    margin: 20,
    marginBottom: 0,
    padding: 20,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  summaryLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.primary,
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
    marginBottom: 8,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.success,
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  statusBadge: {
    backgroundColor: 'rgba(50, 215, 75, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    color: Colors.success,
    fontSize: 12,
    fontWeight: '600',
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
