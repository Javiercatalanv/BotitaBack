import { connect, disconnect } from 'mongoose';
import { Cancha, CanchaSchema } from './schemas/cancha.schema';
import { model } from 'mongoose';

const DB_URI = 'mongodb://localhost:27017/padel';

const canchas = [
  { nombre: 'Cancha 1', maxJugadores: 4 },
  { nombre: 'Cancha 2', maxJugadores: 4 },
  { nombre: 'Cancha 3', maxJugadores: 2 },
  { nombre: 'Cancha 4', maxJugadores: 2 },
  { nombre: 'Cancha 5', maxJugadores: 2 },
  { nombre: 'Cancha 6', maxJugadores: 3 },
  { nombre: 'Cancha 7', maxJugadores: 4 },
];

async function seed() {
  try {
    await connect(DB_URI);
    const CanchaModel = model('Cancha', CanchaSchema);

    // Eliminar todas las canchas existentes
    await CanchaModel.deleteMany({});
    
    // Insertar las nuevas
    await CanchaModel.insertMany(canchas);

    console.log('✅ Canchas insertadas correctamente');
  } catch (error) {
    console.error('❌ Error al insertar canchas:', error);
  } finally {
    await disconnect();
  }
}

seed();
