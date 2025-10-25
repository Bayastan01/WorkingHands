// src/screens/MapScreen.tsx
import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, Image, TouchableOpacity,
  SafeAreaView, ActivityIndicator, Modal, Platform
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { getShiftsByCoords, Shift } from '../api/api';

// координаты по умолчанию (можешь заменить на реальные)
const DEFAULT_LAT = 45.039268;
const DEFAULT_LON = 38.987221;

export default function MapScreen() {
  const [loading, setLoading] = useState(true);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Shift | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const mapRef = useRef<MapView | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        // TODO: вместо дефолтных координат можно получить геолокацию
        const lat = DEFAULT_LAT;
        const lon = DEFAULT_LON;
        const data = await getShiftsByCoords(lat, lon);
        if (!mounted) return;
        setShifts(data);
        // если есть маркеры — подогнать зум
        if (mapRef.current && data.length > 0) {
          const coords = data
            .map(s => s.coordinates)
            .filter((c): c is { latitude:number; longitude:number } => !!c && typeof c.latitude === 'number' && typeof c.longitude === 'number')
            .map(c => ({ latitude: c.latitude, longitude: c.longitude }));
          if (coords.length > 0) {
            setTimeout(() => {
              try {
                mapRef.current?.fitToCoordinates(coords, { edgePadding: { top:80, right:80, bottom:200, left:80 }, animated: true });
              } catch (e) { /* ignore */ }
            }, 400);
          }
        }
      } catch (e: any) {
        setError(String(e?.message ?? e));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const onMarkerPress = (shift: Shift) => {
    setSelected(shift);
    setModalVisible(true);
  };

  const renderMarker = (s: Shift) => {
    const lat = s.coordinates?.latitude;
    const lon = s.coordinates?.longitude;
    if (typeof lat !== 'number' || typeof lon !== 'number') return null;
    return (
      <Marker
        key={s.id}
        coordinate={{ latitude: lat, longitude: lon }}
        title={s.companyName}
        description={s.address}
        onPress={() => onMarkerPress(s)}
      >
        {s.logo ? (
          <Image source={{ uri: s.logo }} style={styles.markerImg} />
        ) : (
          <View style={styles.markerFallback}><Text style={styles.markerText}>{s.priceWorker ?? '—'}₽</Text></View>
        )}
      </Marker>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.center}><ActivityIndicator size="large"/><Text style={{marginTop:8}}>Загрузка...</Text></SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.center}><Text>Ошибка: {error}</Text></SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: DEFAULT_LAT,
          longitude: DEFAULT_LON,
          latitudeDelta: 0.12,
          longitudeDelta: 0.12,
        }}
        showsUserLocation={Platform.OS !== 'web'} // простая логика
        showsMyLocationButton
      >
        {shifts.map(renderMarker)}
      </MapView>

      {/* Bottom modal — простая реализация без сторонних библиотек */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selected?.companyName ?? 'Детали'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.closeBtn}>Закрыть</Text>
              </TouchableOpacity>
            </View>

            <View style={{paddingHorizontal:12}}>
              {selected?.logo ? <Image source={{uri:selected.logo}} style={styles.logo} /> : null}
              <Text style={styles.bold}>{selected?.dateStartByCity ?? ''} {selected?.timeStartByCity ? `· ${selected?.timeStartByCity}` : ''}</Text>
              <Text style={{marginTop:6}}>{selected?.address ?? ''}</Text>
              <Text style={{marginTop:6}}>Оплата: <Text style={styles.bold}>{selected?.priceWorker ?? '—'} ₽</Text></Text>
              <Text style={{marginTop:6}}>Набрано: {selected?.currentWorkers ?? '—'} / {selected?.planWorkers ?? '—'}</Text>
              <Text style={{marginTop:6}}>Отзывы: {selected?.customerFeedbacksCount ?? '—'}</Text>
              <Text style={{marginTop:6}}>Рейтинг: {selected?.customerRating ?? '—'}</Text>
            </View>

            <View style={{height:14}} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },

  center: { flex:1, justifyContent:'center', alignItems:'center' },

  markerImg: { width:40, height:40, borderRadius:8, borderWidth:1, borderColor:'#fff' },
  markerFallback: { backgroundColor:'#2A9D8F', paddingHorizontal:8, paddingVertical:6, borderRadius:8 },
  markerText: { color:'#fff', fontWeight:'700' },

  modalOverlay: {
    flex:1,
    justifyContent:'flex-end',
    backgroundColor:'rgba(0,0,0,0.35)',
  },
  modalCard: {
    backgroundColor:'#fff',
    borderTopLeftRadius:12,
    borderTopRightRadius:12,
    paddingTop:12,
    paddingBottom:24,
    maxHeight:'80%',
  },
  modalHeader: { flexDirection:'row', justifyContent:'space-between', alignItems:'center', paddingHorizontal:12, marginBottom:6 },
  modalTitle: { fontWeight:'700', fontSize:16 },
  closeBtn: { color:'#007AFF', fontWeight:'600' },

  logo: { width:'100%', height:160, borderRadius:8, backgroundColor:'#eee', marginTop:6 },
  bold: { fontWeight:'700' },
});
