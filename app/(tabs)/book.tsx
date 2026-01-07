import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image, ActivityIndicator } from 'react-native';
import { Calendar as CalendarIcon, Clock, Check, User } from 'lucide-react-native';
import { Calendar } from 'react-native-calendars';
import { Colors } from '../../constants/Colors';
import { Button } from '../../components/Button';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

interface Service {
  id: string;
  name: string;
  price: string;
}

interface Barber {
  id: string;
  name: string;
  image: string;
}

const TIME_SLOTS = [
  '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
];

export default function BookScreen() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [services, setServices] = useState<Service[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedBarber, setSelectedBarber] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  useEffect(() => {
    fetchOptions();
  }, []);

  const fetchOptions = async () => {
    try {
      const { data: servicesData } = await supabase.from('services').select('*');
      const { data: barbersData } = await supabase.from('barbers').select('*');
      
      // Sort services by price (convert "R$ 50,00" to number for sorting)
      const sortedServices = (servicesData || []).sort((a, b) => {
        const priceA = parseFloat(a.price.replace('R$ ', '').replace(',', '.').trim());
        const priceB = parseFloat(b.price.replace('R$ ', '').replace(',', '.').trim());
        return priceA - priceB;
      });

      setServices(sortedServices);
      setBarbers(barbersData || []);
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Não foi possível carregar os serviços.');
    } finally {
      setLoadingData(false);
    }
  };

  const handleBooking = async () => {
    if (!selectedService || !selectedBarber || !selectedDate || !selectedTime) {
      Alert.alert('Atenção', 'Por favor, preencha todos os campos.');
      return;
    }

    if (!user) {
      Alert.alert('Erro', 'Usuário não autenticado.');
      return;
    }

    try {
      setSubmitting(true);

      // Envia os dados do agendamento para o Supabase (admin panel)
      const { error } = await supabase.from('appointments').insert({
        user_id: user.id,
        service_id: selectedService,
        barber_id: selectedBarber,
        date: selectedDate,
        time: selectedTime,
        status: 'pending'
      });

      if (error) {
        console.error('Erro ao salvar agendamento:', error);
        throw error;
      }
      
      Alert.alert(
        'Sucesso!',
        'Seu agendamento foi realizado com sucesso.',
        [
          { text: 'OK', onPress: () => router.push('/(tabs)') }
        ]
      );
    } catch (error: any) {
      Alert.alert('Erro ao agendar', error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const formatPrice = (price: string) => price;

  if (loadingData) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.headerTitle}>Novo Agendamento</Text>

      {/* 1. Service Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>1. Escolha o Serviço</Text>
        <View style={styles.chipsContainer}>
          {services.map((service) => (
            <TouchableOpacity
              key={service.id}
              style={[
                styles.chip,
                selectedService === service.id && styles.chipSelected
              ]}
              onPress={() => setSelectedService(service.id)}
            >
              <Text style={[
                styles.chipText,
                selectedService === service.id && styles.chipTextSelected
              ]}>
                {service.name} - {formatPrice(service.price)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* 2. Barber Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>2. Escolha o Profissional</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.barberList}>
          {barbers.map((barber) => (
            <TouchableOpacity
              key={barber.id}
              style={[
                styles.barberItem,
                selectedBarber === barber.id && styles.barberItemSelected
              ]}
              onPress={() => setSelectedBarber(barber.id)}
            >
              <Image 
                source={{ uri: barber.image || 'https://via.placeholder.com/100' }}
                style={[
                  styles.barberImage,
                  selectedBarber === barber.id && styles.barberImageSelected
                ]} 
              />
              <Text style={[
                styles.barberName,
                selectedBarber === barber.id && styles.barberNameSelected
              ]}>{barber.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* 3. Date Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>3. Escolha a Data</Text>
        <Calendar
          onDayPress={(day: any) => setSelectedDate(day.dateString)}
          minDate={new Date().toISOString().split('T')[0]}
          markedDates={{
            [selectedDate]: { selected: true, disableTouchEvent: true, selectedColor: 'orange' }
          }}
          theme={{
            backgroundColor: Colors.surface,
            calendarBackground: Colors.surface,
            textSectionTitleColor: Colors.textSecondary,
            selectedDayBackgroundColor: Colors.primary,
            selectedDayTextColor: '#000',
            todayTextColor: Colors.primary,
            dayTextColor: Colors.text,
            textDisabledColor: '#444',
            dotColor: Colors.primary,
            selectedDotColor: '#ffffff',
            arrowColor: Colors.primary,
            monthTextColor: Colors.text,
            indicatorColor: Colors.primary,
          }}
          style={styles.calendar}
        />
      </View>

      {/* 4. Time Selection */}
      {selectedDate ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Escolha o Horário</Text>
          <View style={styles.gridContainer}>
            {TIME_SLOTS.map((time) => (
              <TouchableOpacity
                key={time}
                style={[
                  styles.timeSlot,
                  selectedTime === time && styles.timeSlotSelected
                ]}
                onPress={() => setSelectedTime(time)}
              >
                <Text style={[
                  styles.timeText,
                  selectedTime === time && styles.timeTextSelected
                ]}>{time}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ) : null}

      <View style={styles.footer}>
        <Button 
          title={submitting ? "Agendando..." : "Confirmar Agendamento"}
          onPress={handleBooking}
          loading={submitting}
          disabled={!selectedService || !selectedBarber || !selectedDate || !selectedTime || submitting}
          style={{ opacity: (!selectedService || !selectedBarber || !selectedDate || !selectedTime) ? 0.5 : 1 }}
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
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 30,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    color: Colors.text,
    fontSize: 14,
  },
  chipTextSelected: {
    color: '#000',
    fontWeight: '600',
  },
  barberList: {
    gap: 16,
  },
  barberItem: {
    alignItems: 'center',
    marginRight: 10,
    padding: 10,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    minWidth: 100,
  },
  barberItemSelected: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
  },
  barberImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  barberImageSelected: {
    borderColor: Colors.primary,
  },
  barberName: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '500',
  },
  barberNameSelected: {
    color: Colors.primary,
    fontWeight: 'bold',
  },
  calendar: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  timeSlot: {
    width: '30%',
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  timeSlotSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  timeText: {
    color: Colors.text,
    fontSize: 14,
  },
  timeTextSelected: {
    color: '#000',
    fontWeight: '600',
  },
  footer: {
    marginTop: 20,
  },
});
