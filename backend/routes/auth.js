import express from 'express';
import User from '../models/User.js';
import Company from '../models/Company.js';
import Doctor from '../models/Doctor.js';

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

router.post('/register-company', async (req, res) => {
  try {
    const {
      nombre,
      razonSocial,
      rfc,
      direccion,
      telefono,
      email,
      adminUsername,
      adminPassword,
      adminNombre
    } = req.body;

    const existingCompany = await Company.findOne({
      $or: [{ rfc }, { email }]
    });

    if (existingCompany) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe una empresa con ese RFC o email'
      });
    }

    const existingUser = await User.findOne({ username: adminUsername });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'El nombre de usuario ya está en uso'
      });
    }

    const company = new Company({
      nombre,
      razonSocial,
      rfc,
      direccion,
      telefono,
      email
    });

    await company.save();

    const adminUser = new User({
      username: adminUsername,
      password: adminPassword,
      role: 'empresa',
      nombre: adminNombre,
      companyId: company._id
    });

    await adminUser.save();

    const userResponse = {
      id: adminUser._id,
      username: adminUser.username,
      nombre: adminUser.nombre,
      role: adminUser.role
    };

    res.json({
      success: true,
      message: 'Empresa registrada exitosamente',
      user: userResponse
    });

  } catch (error) {
    console.error('Error al registrar empresa:', error);
    res.status(500).json({
      success: false,
      message: 'Error al registrar empresa'
    });
  }
});

router.post('/create-user', async (req, res) => {
  try {
    const {
      username,
      password,
      role,
      nombre,
      companyId,
      consultorio
    } = req.body;

    const adminUser = await User.findById(req.body.adminId);
    if (!adminUser || adminUser.role !== 'empresa') {
      return res.status(403).json({
        success: false,
        message: 'No tiene permisos para crear usuarios'
      });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'El nombre de usuario ya existe'
      });
    }

    const newUser = new User({
      username,
      password,
      role,
      nombre,
      companyId: adminUser.companyId,
      consultorio: role === 'consultorio' ? consultorio : undefined
    });

    await newUser.save();

    res.json({
      success: true,
      message: 'Usuario creado exitosamente',
      user: {
        id: newUser._id,
        username: newUser.username,
        nombre: newUser.nombre,
        role: newUser.role,
        consultorio: newUser.consultorio
      }
    });

  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear usuario'
    });
  }
});

router.post('/create-doctor', async (req, res) => {
  try {
    const {
      nombre,
      apellidos,
      especialidad,
      cedulaProfesional,
      consultorio,
      prioridadesAsignadas,
      telefono,
      email,
      username,
      password,
      adminId
    } = req.body;

    const adminUser = await User.findById(adminId);
    if (!adminUser || adminUser.role !== 'empresa') {
      return res.status(403).json({
        success: false,
        message: 'No tiene permisos para crear doctores'
      });
    }

    const existingDoctor = await Doctor.findOne({ cedulaProfesional });
    if (existingDoctor) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un doctor con esa cédula profesional'
      });
    }

    let doctorUser = null;
    if (username && password) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'El nombre de usuario ya existe'
        });
      }

      doctorUser = new User({
        username,
        password,
        role: 'consultorio',
        nombre: `${nombre} ${apellidos}`,
        companyId: adminUser.companyId,
        consultorio
      });

      await doctorUser.save();
    }

    const doctor = new Doctor({
      nombre,
      apellidos,
      especialidad,
      cedulaProfesional,
      consultorio,
      prioridadesAsignadas,
      companyId: adminUser.companyId,
      userId: doctorUser ? doctorUser._id : undefined,
      telefono,
      email
    });

    await doctor.save();

    res.json({
      success: true,
      message: 'Doctor creado exitosamente',
      doctor: {
        id: doctor._id,
        nombre: doctor.nombre,
        apellidos: doctor.apellidos,
        especialidad: doctor.especialidad,
        consultorio: doctor.consultorio,
        prioridadesAsignadas: doctor.prioridadesAsignadas
      }
    });

  } catch (error) {
    console.error('Error al crear doctor:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear doctor'
    });
  }
});

router.get('/company-users/:companyId', async (req, res) => {
  try {
    const users = await User.find({
      companyId: req.params.companyId,
      activo: true
    }).select('-password');

    res.json({
      success: true,
      users
    });

  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener usuarios'
    });
  }
});

router.get('/company-doctors/:companyId', async (req, res) => {
  try {
    const doctors = await Doctor.find({
      companyId: req.params.companyId,
      activo: true
    }).populate('userId', 'username');

    res.json({
      success: true,
      doctors
    });

  } catch (error) {
    console.error('Error al obtener doctores:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener doctores'
    });
  }
});

export default router;
