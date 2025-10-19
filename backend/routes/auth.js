import express from 'express';
import User from '../models/User.js';

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Usuario y contraseña son requeridos'
      });
    }

    const user = await User.findOne({ username, activo: true });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    if (user.password !== password) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    const userResponse = {
      id: user._id,
      username: user.username,
      nombre: user.nombre,
      role: user.role
    };

    res.json({
      success: true,
      message: 'Login exitoso',
      user: userResponse
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
  }
});

router.post('/seed-users', async (req, res) => {
  try {
    const usersCount = await User.countDocuments();

    if (usersCount > 0) {
      return res.json({
        success: true,
        message: 'Los usuarios ya existen en la base de datos'
      });
    }

    const defaultUsers = [
      {
        username: 'saviser',
        password: 'saviser123',
        role: 'empleado',
        nombre: 'Usuario Empleado SAVISER'
      },
      {
        username: 'empresa',
        password: 'empresa123',
        role: 'empresa',
        nombre: 'Administrador Empresa'
      },
      {
        username: 'secretaria',
        password: 'secretaria123',
        role: 'secretaria',
        nombre: 'Secretaria SAVISER'
      },
      {
        username: 'consultorio',
        password: 'consultorio123',
        role: 'consultorio',
        nombre: 'Consultorio Médico'
      }
    ];

    await User.insertMany(defaultUsers);

    res.json({
      success: true,
      message: 'Usuarios creados exitosamente',
      users: defaultUsers.map(u => ({ username: u.username, role: u.role }))
    });

  } catch (error) {
    console.error('Error al crear usuarios:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear usuarios'
    });
  }
});

export default router;
