export type UserRole = "admin" | "student";

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
};

export type Course = {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail_key: string | null;
  is_published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type Module = {
  id: string;
  course_id: string;
  title: string;
  description: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type Lesson = {
  id: string;
  module_id: string;
  title: string;
  description: string;
  body: string;
  video_key: string | null;
  video_content_type: string | null;
  duration_seconds: number | null;
  is_published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type LessonResource = {
  id: string;
  lesson_id: string;
  title: string;
  file_key: string;
  file_name: string;
  content_type: string;
  size_bytes: number | null;
  created_at: string;
};

export type Entitlement = {
  id: string;
  user_id: string;
  product_code: string;
  status: "active" | "revoked" | "expired";
  stripe_customer_id: string | null;
  stripe_checkout_session_id: string | null;
  stripe_payment_intent_id: string | null;
  access_starts_at: string;
  access_ends_at: string;
  created_at: string;
  updated_at: string;
};

export type LessonProgress = {
  id: string;
  user_id: string;
  lesson_id: string;
  completed: boolean;
  progress_percent: number;
  last_position_seconds: number;
  completed_at: string | null;
  updated_at: string;
};

export type ModuleWithLessons = Module & {
  lessons: Lesson[];
};

export type CourseWithModules = Course & {
  modules: ModuleWithLessons[];
};
