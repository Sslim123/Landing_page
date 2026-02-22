
import React, { useState } from "react";

const ApplyForm = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const form = e.target;

    try {
      // --Apply for free course 
      const response = await fetch(
        `/api/apply-free-course`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name.value.trim(),
            email: form.email.value.trim(),
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Server error");
      }

      setMessage({
        type: "success",
        text: "✅ تم التسجيل بنجاح. سيتم إرسال رابط الدورة إلى بريدك بعد أيام.",
      });

      form.reset(); // ✅ الآن سيفرغ الحقول
    } catch (error) {
      console.error(error);
      setMessage({
        type: "error",
        text: "❌ حدث خطأ أثناء الإرسال. حاول مرة أخرى.",
      });
    } finally {
      setLoading(false); // ✅ مهم جدًا
    }
  };

  return (

    <div
      className="min-vh-100 d-flex align-items-center justify-content-center p-3"
      dir="rtl"
      style={{
        background: "radial-gradient(circle at top right, #0f172a, #020617)",
        color: "#f8fafc",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
      }}
    >
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">

            {/* Logo and Header Section */}
            <div className="text-center mb-4">
              <div className="mb-3 position-relative d-inline-block">
                <div
                  className="position-absolute top-50 start-50 translate-middle"
                  style={{
                    width: "80px",
                    height: "80px",
                    background: "rgba(34, 197, 94, 0.2)",
                    filter: "blur(20px)",
                    borderRadius: "50%",
                    zIndex: 0
                  }}
                ></div>

                <img src="https://res.cloudinary.com/dndvxb9hk/image/upload/v1770707447/nyala-academy-logo_tudtwu.png"
                  alt="Logo"
                  className="position-relative"
                  style={{
                    height: "60px",
                    width: "auto",
                    zIndex: 1,
                    filter: "drop-shadow(0 0 8px rgba(255,255,255,0.1))"
                  }}
                />
              </div>

              <h1 className="display-6 fw-bold mb-2" style={{ letterSpacing: "-1px" }}>
                أساسيات <span style={{ color: "#22c55e" }}>لينكس وويندوز</span>
              </h1>
              <p className="lead text-secondary opacity-75">
                ابدأ رحلتك التقنية بمقعد مجاني بالكامل
              </p>
            </div>

            {/* Form Card */}
            <div
              className="p-4 p-md-5 rounded-4 shadow-lg"
              style={{
                background: "rgba(30, 41, 59, 0.5)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              <div className="mb-4">
                <h5 className="fw-bold mb-1">انضم إلى قائمة الانتظار</h5>
                <p className="small text-secondary">سجّل الآن، واحصل على الوصول خلال أيام</p>
              </div>

              {message && (
                <div
                  className={`alert ${message.type === "success" ? "alert-success" : "alert-danger"
                    } border-0 shadow-sm text-center mb-4`}
                  style={{ borderRadius: "12px" }}
                >
                  {message.text}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label small fw-medium opacity-75">الاسم الكامل</label>
                  <input
                    type="text"
                    name="name"
                    className="form-control form-control-lg border-0 shadow-none"
                    placeholder="أدخل اسمك الثلاثي"
                    style={{
                      background: "rgba(15, 23, 42, 0.8)",
                      color: "#fff",
                      borderRadius: "10px",
                      fontSize: "0.95rem"
                    }}
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label small fw-medium opacity-75">البريد الإلكتروني</label>
                  <input
                    type="email"
                    name="email"
                    className="form-control form-control-lg border-0 shadow-none"
                    placeholder="example@gmail.com"
                    style={{
                      background: "rgba(15, 23, 42, 0.8)",
                      color: "#fff",
                      borderRadius: "10px",
                      fontSize: "0.95rem"
                    }}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-lg w-100 fw-bold py-3"
                  disabled={loading}
                  style={{
                    background: "linear-gradient(45deg, #22c55e, #16a34a)",
                    border: "none",
                    color: "#fff",
                    borderRadius: "10px",
                    boxShadow: "0 4px 15px rgba(34, 197, 94, 0.3)",
                    transition: "transform 0.2s"
                  }}
                  onMouseEnter={(e) => e.target.style.transform = "translateY(-2px)"}
                  onMouseLeave={(e) => e.target.style.transform = "translateY(0)"}
                >
                  {loading ? (
                    <span className="spinner-border spinner-border-sm"></span>
                  ) : (
                    "احجز مقعدك المجاني الآن"
                  )}
                </button>
              </form>

              <div className="mt-4 pt-3 border-top border-secondary border-opacity-25 text-center">
                <p className="text-secondary small mb-0">
                  🔒 نعدك بعدم إرسال رسائل مزعجة.
                </p>
              </div>
            </div>

            {/* Footer Benefits */}
            <div className="mt-5 d-flex justify-content-center gap-4 opacity-50 small flex-wrap text-center">
              <span>✔️ 100% مجاناً</span>
              <span>✔️ شهادة إتمام</span>
              <span>✔️ تطبيق عملي</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default ApplyForm;