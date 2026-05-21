// ============================================================
// MOCK DATA - Replace with real API calls when backend is ready
// ============================================================
// 
// TODO (Backend Developer):
// - Replace mockUserData with data fetched from GET /api/user/profile
// - Replace mockUpdateUserProfile with POST /api/user/profile
// - Replace mockProfileImage with the real user image URL from backend
// - Connect to AppContext with real API calls
// ============================================================

export const mockProfileImage = "https://i.pinimg.com/736x/7a/58/79/7a587917c52780a7820c526426887c7a.jpg";

export const mockUserData = {
  _id: "mock_user_001",
  name: "عبسميع  ",
  email: "abdo@example.com",
  phone: "+20 1029317818",
  image: mockProfileImage,
  address: {
    line1: "شارع التحرير 123",
    line2: "القاهرة، مصر",
  },
  gender: "Male",
  dob: "2003-03-15",
  createdAt: "2024-01-15T10:30:00.000Z",
};

// TODO (Backend): Replace this mock function with actual API call
// Expected endpoint: PUT /api/user/update-profile
// Expected payload: FormData with name, phone, address, gender, dob, image
// Expected response: { success: boolean, message: string }
export const mockUpdateUserProfile = async (_formData) => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1500));
  
  // Simulate success (return true) or failure (return false)
  // Change to false to test error handling
  return true;
};

// TODO (Backend): Replace with actual API call
// Expected endpoint: GET /api/user/profile  
// Expected response: { success: boolean, userData: UserData }
export const mockLoadUserProfile = async () => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 800));
  return mockUserData;
};














// ============================================================
// APPOINTMENTS MOCK DATA
// ============================================================

export const mockAppointments = [
  {
    _id: "appt_001",
    serviceId: {
      _id: "svc_001",
      title: "فحص عام شامل",
    },
    doctorName: "د. خالد الخطيب",
    date: "2025-02-15",
    time: "10:00 ص",
    amount: 350,
    paid: true,
    status: "completed",
    createdAt: "2025-01-20T08:00:00.000Z",
  },
  {
    _id: "appt_002",
    serviceId: {
      _id: "svc_002",
      title: "استشارة أسنان",
    },
    doctorName: "د. سارة المنصور",
    date: "2025-03-05",
    time: "02:30 م",
    amount: 500,
    paid: true,
    status: "confirmed",
    createdAt: "2025-02-10T14:30:00.000Z",
  },
  {
    _id: "appt_003",
    serviceId: {
      _id: "svc_003",
      title: "فحص نظر",
    },
    doctorName: "د. عمر الحربي",
    date: "2025-03-20",
    time: "11:00 ص",
    amount: 200,
    paid: false,
    status: "pending",
    createdAt: "2025-03-01T09:00:00.000Z",
  },
  {
    _id: "appt_004",
    serviceId: {
      _id: "svc_004",
      title: "جلسة علاج طبيعي",
    },
    doctorName: "د. نورة القحطاني",
    date: "2025-03-25",
    time: "04:00 م",
    amount: 450,
    paid: false,
    status: "pending",
    createdAt: "2025-03-05T16:00:00.000Z",
  },
  {
    _id: "appt_005",
    category: "استشارة جلدية",
    doctorName: "د. فهد الشمري",
    date: "2025-01-10",
    time: "09:00 ص",
    amount: 300,
    paid: false,
    status: "cancelled",
    createdAt: "2024-12-20T10:00:00.000Z",
  },
  {
    _id: "appt_006",
    serviceId: {
      _id: "svc_006",
      title: "تنظيف أسنان",
    },
    doctorName: "د. سارة المنصور",
    date: "2025-04-01",
    time: "01:00 م",
    amount: 250,
    paid: false,
    status: "confirmed",
    createdAt: "2025-03-10T12:00:00.000Z",
  },
];

// TODO (Backend): Replace with actual API call
// Expected endpoint: GET /api/appointments/user
// Expected response: { success: boolean, appointments: Appointment[] }
export const mockGetUserAppointments = async () => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return { success: true, appointments: mockAppointments };
};

// TODO (Backend): Replace with actual API call
// Expected endpoint: POST /api/appointments/cancel
// Expected payload: { appointmentId: string }
// Expected response: { success: boolean, message: string }
export const mockCancelAppointment = async (_appointmentId) => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1200));
  return { success: true, message: "تم إلغاء الموعد بنجاح" };
};

// TODO (Backend): Replace with actual API call
// Expected endpoint: POST /api/payment/initiate
// Expected payload: { appointmentId: string }
// Expected response: { success: boolean, paymentUrl: string, message?: string }
export const mockInitiatePayment = async (_appointmentId) => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1500));
  // In mock mode, we'll simulate the payment inline (no real popup)
  return {
    success: true,
    paymentUrl: "https://example.com/mock-payment",
  };
};

// TODO (Backend): Replace with actual API call
// Expected endpoint: POST /api/payment/verify
// Expected payload: { appointmentId: string }
// Expected response: { paid: boolean }
export const mockVerifyPayment = async (_appointmentId) => {
  await new Promise((resolve) => setTimeout(resolve, 800));
  return { paid: true };
};






// ============================================================
// COURSES MOCK DATA
// ============================================================
// 
// TODO (Backend Developer):
// - Replace mockEnrolledCourses with data fetched from GET /api/courses/enrolled
// - Connect to CourseContext with real API calls
// - Course thumbnails are using placeholder images from unsplash
// - Replace navigate() calls with actual react-router-dom navigation
// ============================================================

export const mockEnrolledCourses = [
  {
    _id: "course_001",
    title_ar: "أساسيات التغذية العلاجية",
    category: "تغذية",
    thumbnail: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&h=400&fit=crop",
    progress: 100,
    totalDuration: "12 ساعة",
    totalLessons: 24,
    enrolledAt: "2024-09-15T10:00:00.000Z",
    instructor: "د. فاطمة الزهراء",
    description_ar: "دورة شاملة في أساسيات التغذية العلاجية وتطبيقاتها السريرية",
  },
  {
    _id: "course_002",
    title_ar: "الإسعافات الأولية المتقدمة",
    category: "طب طوارئ",
    thumbnail: "https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?w=600&h=400&fit=crop",
    progress: 72,
    totalDuration: "8 ساعات",
    totalLessons: 16,
    enrolledAt: "2024-11-01T14:30:00.000Z",
    instructor: "د. محمد الأحمد",
    description_ar: "تعلم تقنيات الإسعافات الأولية المتقدمة للحالات الطارئة",
  },
  {
    _id: "course_003",
    title_ar: "صحة الأطفال والتطعيمات",
    category: "طب أطفال",
    thumbnail: "https://images.unsplash.com/photo-1587654780291-39c9404d7dd0?w=600&h=400&fit=crop",
    progress: 45,
    totalDuration: "15 ساعة",
    totalLessons: 30,
    enrolledAt: "2025-01-10T09:00:00.000Z",
    instructor: "د. ليلى الحسن",
    description_ar: "دليل شامل لصحة الأطفال وجداول التطعيمات الأساسية",
  },
  {
    _id: "course_004",
    title_ar: "العلاج الطبيعي وإعادة التأهيل",
    category: "علاج طبيعي",
    thumbnail: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&h=400&fit=crop",
    progress: 18,
    totalDuration: "20 ساعة",
    totalLessons: 40,
    enrolledAt: "2025-02-20T11:00:00.000Z",
    instructor: "د. عبدالله الراشد",
    description_ar: "تقنيات العلاج الطبيعي الحديثة وبرامج إعادة التأهيل",
  },
  {
    _id: "course_005",
    title_ar: "الصحة النفسية وإدارة الضغوط",
    category: "صحة نفسية",
    thumbnail: "https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=600&h=400&fit=crop",
    progress: 0,
    totalDuration: "10 ساعات",
    totalLessons: 20,
    enrolledAt: "2025-03-05T08:00:00.000Z",
    instructor: "د. سلمى العتيبي",
    description_ar: "فهم الصحة النفسية وتعلم استراتيجيات فعالة لإدارة الضغوط",
  },
  {
    _id: "course_006",
    title_ar: "أمراض القلب والأوعية الدموية",
    category: "أمراض قلب",
    thumbnail: "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=600&h=400&fit=crop",
    progress: 100,
    totalDuration: "18 ساعة",
    totalLessons: 36,
    enrolledAt: "2024-06-01T10:00:00.000Z",
    instructor: "د. خالد المنصور",
    description_ar: "دراسة شاملة لأمراض القلب والأوعية الدموية وطرق الوقاية",
  },
];

// TODO (Backend): Replace with actual API call
// Expected endpoint: GET /api/courses/enrolled
// Expected response: { success: boolean, courses: EnrolledCourse[] }
export const mockGetUserCourses = async () => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return { success: true, courses: mockEnrolledCourses };
};
