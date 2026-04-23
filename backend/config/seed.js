const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();

const User = require('../models/User');
const Course = require('../models/Course');
const Coupon = require('../models/Coupon');

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await User.deleteMany();
  await Course.deleteMany();
  await Coupon.deleteMany();

  const password = await bcrypt.hash('password123', 10);

  const admin = await User.create({ name: 'Admin User', email: 'admin@lms.com', password, role: 'admin' });
  const instructor = await User.create({ name: 'Jane Instructor', email: 'instructor@lms.com', password, role: 'instructor' });
  await User.create({ name: 'John Student', email: 'student@lms.com', password, role: 'student' });

  await Course.create([
    { title: 'React Mastery', description: 'Complete React course from basics to advanced.', instructor: instructor._id, price: 1999, category: 'Web Development', level: 'intermediate', thumbnail: 'https://placehold.co/600x400/0D9488/white?text=React+Mastery' },
    { title: 'Node.js Backend', description: 'Build scalable REST APIs with Node and Express.', instructor: instructor._id, price: 1499, category: 'Backend', level: 'beginner', thumbnail: 'https://placehold.co/600x400/0891B2/white?text=Node.js+Backend' },
    { title: 'MongoDB Deep Dive', description: 'Master MongoDB for modern applications.', instructor: instructor._id, price: 999, category: 'Database', level: 'beginner', thumbnail: 'https://placehold.co/600x400/065A82/white?text=MongoDB+Deep+Dive' },
  ]);

  await Coupon.create([
    { code: 'SAVE10', discountType: 'percentage', discountValue: 10, maxUses: 100, createdBy: admin._id },
    { code: 'FLAT200', discountType: 'fixed', discountValue: 200, maxUses: 50, createdBy: admin._id },
  ]);

  console.log('Seed complete!');
  console.log('Admin:      admin@lms.com / password123');
  console.log('Instructor: instructor@lms.com / password123');
  console.log('Student:    student@lms.com / password123');
  process.exit();
};

seed().catch(err => { console.error(err); process.exit(1); });
