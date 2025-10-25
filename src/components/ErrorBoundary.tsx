// src/components/ErrorBoundary.tsx
import React from 'react';
import { View, Text, Button } from 'react-native';

export class ErrorBoundary extends React.Component<any, { hasError: boolean }> {
  constructor(props: any) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: any, info: any) { console.error('ErrorBoundary caught', error, info); }
  render() {
    if (this.state.hasError) {
      return (
        <View style={{flex:1,justifyContent:'center',alignItems:'center',padding:20}}>
          <Text style={{fontWeight:'700',marginBottom:8}}>Произошла ошибка</Text>
          <Text style={{marginBottom:12}}>Ошибка в JS-рендере — см. консоль</Text>
          <Button title="Перезапустить" onPress={() => { this.setState({ hasError:false }); }} />
        </View>
      );
    }
    return this.props.children;
  }
}
