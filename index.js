```javascript
const fs = require('fs');
const path = require('path');

// ============================================================================
// SIMULADOR DE PORTAFOLIO DE INVERSIONES CON GRÁFICAS
// ============================================================================

class Inversion {
  constructor(nombre, cantidad, precioInicial, tipo = 'accion') {
    this.nombre = nombre;
    this.cantidad = cantidad;
    this.precioInicial = precioInicial;
    this.precioActual = precioInicial;
    this.tipo = tipo; // accion, bonos, criptomoneda
    this.historial = [{ dia: 0, precio: precioInicial, valor: cantidad * precioInicial }];
  }

  actualizarPrecio(nuevoPrecio) {
    this.precioActual = nuevoPrecio;
    const dia = this.historial.length;
    this.historial.push({
      dia,
      precio: nuevoPrecio,
      valor: this.cantidad * nuevoPrecio
    });
  }

  getValorActual() {
    return this.cantidad * this.precioActual;
  }

  getRetorno() {
    const invertidoInicial = this.cantidad * this.precioInicial;
    return ((this.getValorActual() - invertidoInicial) / invertidoInicial) * 100;
  }
}

class Portafolio {
  constructor(nombre, capitalInicial) {
    this.nombre = nombre;
    this.capitalInicial = capitalInicial;
    this.inversiones = [];
    this.efectivo = capitalInicial;
    this.historialValorTotal = [capitalInicial];
  }

  agregarInversion(inversion) {
    const costo = inversion.cantidad * inversion.precioInicial;
    if (costo > this.efectivo) {
      throw new Error(`Efectivo insuficiente. Disponible: ${this.efectivo}, Requerido: ${costo}`);
    }
    this.inversiones.push(inversion);
    this.efectivo -= costo;
  }

  getValorTotalInversiones() {
    return this.inversiones.reduce((sum, inv) => sum + inv.getValorActual(), 0);
  }

  getValorTotal() {
    return this.efectivo + this.getValorTotalInversiones();
  }

  getRetornoTotal() {
    const invertido = this.capitalInicial - this.efectivo;
    if (invertido === 0) return 0;
    return ((this.getValorTotalInversiones() - invertido) / invertido) * 100;
  }

  simularUnDia(variaciones) {
    variaciones.forEach((variacion, index) => {
      if (this.inversiones[index]) {
        const nuevoPrecio = this.inversiones[index].precioActual * (1 + variacion / 100);
        this.inversiones[index].actualizarPrecio(nuevoPrecio);
      }
    });
    this.historialValorTotal.push(this.getValorTotal());
  }

  resumen() {
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log(`║ PORTAFOLIO: ${this.nombre.padEnd(48)} ║`);
    console.log('╠════════════════════════════════════════════════════════════╣');
    console.log(`║ Capital Inicial:        $${this.capitalInicial.toFixed(2).padStart(50)} ║`);
    console.log(`║ Valor Total Actual:     $${this.getValorTotal().toFixed(2).padStart(50)} ║`);
    console.log(`║ Retorno Total:          ${this.getRetornoTotal().toFixed(2)}%${' '.repeat(46)} ║`);
    console.log(`║ Efectivo Disponible:    $${this.efectivo.toFixed(2).padStart(50)} ║`);
    console.log('╠════════════════════════════════════════════════════════════╣');
    console.log('║ INVERSIONES:                                               ║');
    console.log('╠════════════════════════════════════════════════════════════╣');
    
    this.inversiones.forEach((inv, idx) => {
      const valor = inv.getValorActual();
      const retorno = inv.getRetorno();
      const signo = retorno >= 0 ? '+' : '';
      const linea = `║ ${(idx + 1).toString().padEnd(2)}. ${inv.nombre.padEnd(20)} Precio: $${inv.precioActual.toFixed(2).padEnd(8)} Valor: $${valor.toFixed(2).padStart(12)} Retorno: ${signo}${retorno.toFixed(2)}%`;
      console.log(linea.padEnd(61) + '║');
    });
    
    console.log('╚════════════════════════════════════════════════════════════╝\n');
  }
}

// ============================================================================
// FUNCIONES PARA GENERAR GRÁFICAS ASCII
// ============================================================================

function generarGraficaBarras(titulo, datos, etiquetas, ancho = 60, alto = 15) {
  console.log(`\n${titulo}`);
  console.log('═'.repeat(ancho + 20));
  
  const maxValor = Math.max(...datos);
  const minValor = Math.min(...datos);
  const rango = maxValor - minValor === 0 ? 1 : maxValor - minValor;
  
  for (let fila = alto; fila > 0; fila--) {
    const valor = minValor + (rango * fila) / alto;
    let linea = `${valor.toFixed(0).pad