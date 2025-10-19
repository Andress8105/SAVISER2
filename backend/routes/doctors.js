import express from 'express';
import Doctor from '../models/Doctor.js';

const router = express.Router();

router.get('/assign-by-priority/:companyId/:priority', async (req, res) => {
  try {
    const { companyId, priority } = req.params;

    const priorityMap = {
      'Baja': 'baja',
      'Media': 'media',
      'Alta': 'alta',
      'Crítica': 'critica'
    };

    const normalizedPriority = priorityMap[priority];

    const availableDoctors = await Doctor.find({
      companyId,
      activo: true,
      prioridadesAsignadas: normalizedPriority
    });

    if (availableDoctors.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No hay doctores disponibles para esta prioridad'
      });
    }

    const randomDoctor = availableDoctors[Math.floor(Math.random() * availableDoctors.length)];

    res.json({
      success: true,
      doctor: {
        id: randomDoctor._id,
        nombre: `${randomDoctor.nombre} ${randomDoctor.apellidos}`,
        especialidad: randomDoctor.especialidad,
        consultorio: randomDoctor.consultorio
      }
    });

  } catch (error) {
    console.error('Error al asignar doctor:', error);
    res.status(500).json({
      success: false,
      message: 'Error al asignar doctor'
    });
  }
});

export default router;
