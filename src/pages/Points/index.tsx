import React, { useState, useEffect } from 'react'
import { View, StyleSheet, TouchableOpacity, Text, ScrollView, Image, Alert } from 'react-native'
import Constants from 'expo-constants'
import { Feather as Icon } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import MapView, { Marker } from 'react-native-maps'
import { SvgCssUri, SvgUri } from 'react-native-svg'
import api from '../../services/api'
import * as Location from 'expo-location'

interface Item {
  id: number,
  name: string,
  image_url: string
}

const Points = () => {
  const navigation = useNavigation()
  const [items, setItems] = useState<Item[]>([])
  const [selectedItems, setSelectedItems] = useState<number[]>([])
  const [initalPosition, setInitialPosition] = useState<[number, number]>([0,0])

  useEffect(() => {
    api.get('items')
      .then(res => {
        setItems(res.data)
      })
      .catch(err => console.log(err))
  }, [])

  useEffect(() => {
    async function loadPosition() {
      const { status } = await Location.requestPermissionsAsync()

      if(status !== 'granted') {
        Alert.alert('Ooopppss...', 'Precisamos da sua localização :)')
        return
      }

      const location = await Location.getCurrentPositionAsync()

      const { latitude, longitude } = location.coords

      setInitialPosition([latitude, longitude])
    }

    loadPosition()
  }, [])

  function handleNavigateBack() {
     navigation.goBack()
  }

  function handleNavigateToDetail() {
    navigation.navigate("Detail")
  }

  function handleSelectItem(id: number) {
    const alrearySelected = selectedItems.findIndex(item => item === id)

    if (alrearySelected >= 0) {
      const fielteredItems = selectedItems.filter(item => item !== id)
      setSelectedItems(fielteredItems)
    } else {
      setSelectedItems([...selectedItems, id])
    }
  }

  return (
    <>
    <View style={styles.container}>
      <TouchableOpacity onPress={handleNavigateBack}>
        <Icon name="arrow-left" size={20} color="#34cb79" />
      </TouchableOpacity>

      <Text style={styles.title}>Bem vindo.</Text>
      <Text style={styles.description}>Encontre no mapa um ponto de coleta.</Text>

      <View style={styles.mapContainer}>
        { initalPosition[0] !== 0 && (
            <MapView
              loadingEnabled={initalPosition[0] === 0}
              style={styles.map}
              initialRegion={{
                latitude: initalPosition[0],
                longitude: initalPosition[1],
                latitudeDelta: 0.014,
                longitudeDelta: 0.014,
              }}
            >
              <Marker
                onPress={handleNavigateToDetail}
                style={styles.mapMarker}
                coordinate={{
                  latitude: -22.6592263,
                  longitude: -43.1490076,
                }}>
                <View style={styles.mapMarkerContainer}>
                  <Image
                    style={styles.mapMarkerImage}
                    source={{ uri: "https://s2.glbimg.com/vmo9jpOdJ51CkO8NMtjPK5RNIHg=/512x320/smart/e.glbimg.com/og/ed/f/original/2018/10/11/como-gastar-menos-no-mercado.jpg" }} />
                  <Text style={styles.mapMarkerTitle}>Mercado</Text>
                </View>
              </Marker>
            </MapView>
        ) }
      </View>
    </View>

    <View style={styles.itemsContainer}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={{
          paddingHorizontal: 20
        }}>
        {items.map(item => (
          <TouchableOpacity 
            key={String(item.id)} 
            style={[
              styles.item,
              selectedItems.includes(item.id) ? styles.selectedItem : {}
            ]} 
            onPress={() => { handleSelectItem(item.id) }}
            activeOpacity={0.5}
          >
            <SvgUri width={42} height={42} uri={item.image_url} />
            <Text style={styles.itemTitle}>{item.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 20 + Constants.statusBarHeight,
  },

  title: {
    fontSize: 20,
    fontFamily: 'Ubuntu_700Bold',
    marginTop: 24,
  },

  description: {
    color: '#6C6C80',
    fontSize: 16,
    marginTop: 4,
    fontFamily: 'Roboto_400Regular',
  },

  mapContainer: {
    flex: 1,
    width: '100%',
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 16,
  },

  map: {
    width: '100%',
    height: '100%',
  },

  mapMarker: {
    width: 90,
    height: 80, 
  },

  mapMarkerContainer: {
    width: 90,
    height: 70,
    backgroundColor: '#34CB79',
    flexDirection: 'column',
    borderRadius: 8,
    overflow: 'hidden',
    alignItems: 'center'
  },

  mapMarkerImage: {
    width: 90,
    height: 45,
    resizeMode: 'cover',
  },

  mapMarkerTitle: {
    flex: 1,
    fontFamily: 'Roboto_400Regular',
    color: '#FFF',
    fontSize: 13,
    lineHeight: 23,
  },

  itemsContainer: {
    flexDirection: 'row',
    marginTop: 16,
    marginBottom: 32,
  },

  item: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#eee',
    height: 120,
    width: 120,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'space-between',

    textAlign: 'center',
  },

  selectedItem: {
    borderColor: '#34CB79',
    borderWidth: 2,
  },

  itemTitle: {
    fontFamily: 'Roboto_400Regular',
    textAlign: 'center',
    fontSize: 13,
  },
});

export default Points