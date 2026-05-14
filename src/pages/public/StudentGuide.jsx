import React, { useState } from 'react';
import './StudentGuide.css';

const StudentGuide = () => {
  const [activeTab, setActiveTab] = useState('sec-1');

  const chapters = [
    { id: 'sec-1', title: 'الفصل ١: مواد اللائحة' },
    { id: 'sec-2', title: 'الفصل ٢: القبول والقيد' },
    { id: 'sec-3', title: 'الفصل ٣: الإرشاد الأكاديمي' },
    { id: 'sec-4', title: 'الفصل ٤: اختيار البرنامج' },
    { id: 'sec-5', title: 'الفصل ٥: إيقاف القيد' },
    { id: 'sec-6', title: 'الفصل ٦: التحويل' },
    { id: 'sec-7', title: 'الفصل ٧: التأديب' },
    { id: 'sec-8', title: 'الفصل ٨: الخدمات' },
    { id: 'sec-10', title: 'الفصل ١٠: شئون الطلاب' },
    { id: 'sec-11', title: 'الفصل ١١: التربية العسكرية' },
    { id: 'sec-12', title: 'الفصل ١٢: مجالات العمل' },
  ];

  const handleTabClick = (id) => {
    setActiveTab(id);
    window.scrollTo({ top: 350, behavior: 'smooth' });
  };

  const renderSection = (id, title, content) => (
    <div
      className={`section ${activeTab === id ? 'active' : ''}`}
      style={{ display: activeTab === id ? 'block' : 'none' }}
    >
      <div
        className="section-head"
        style={{
          marginBottom: '20px',
          borderBottom: '1px solid var(--border2)',
          paddingBottom: '14px',
        }}
      >
        <h2 style={{ fontSize: '1.8rem' }}>{title}</h2>
      </div>
      <div className="article">
        <div className="article-body">{content}</div>
      </div>
    </div>
  );

  return (
    <div className="student-guide-wrapper">
      <div className="topbar">
        <button className="topbar-back" onClick={() => window.history.back()}>
        back←
        </button>
        <div className="topbar-title">
          اللائحة الجديدة 2017
          <small style={{ display: 'block', fontSize: '10px', color: '#5b7a9d' }}>
            كلية العلوم · جامعة عين شمس
          </small>
        </div>
        <div style={{ width: '80px' }}></div>
      </div>

      <div className="page-wrap">
        <div className="hero">
          <span className="hero-icon">📜</span>
          <h1 className="hero-title">اللائحة الداخلية</h1>
          <p className="hero-sub">نظام الساعات المعتمدة - الإصدار المحدث</p>
        </div>

        <div className="toc">
          <div className="toc-label" style={{ color: '#5b7a9d', fontSize: '15px', fontWeight: '700', marginBottom: '16px' }}>
            فصول اللائحة
          </div>
          <ul className="toc-list">
            {chapters.map((chapter) => (
              <li key={chapter.id}>
                <button
                  onClick={() => handleTabClick(chapter.id)}
                  className={`toc-link ${activeTab === chapter.id ? 'active' : ''}`}
                >
                  {chapter.title}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div id="content-area">
          {renderSection('sec-1', 'الفصل ١: الدرجات العلمية ونظام الدراسة', <>
            <p><strong>مادة (٤) - مدة الدراسة:</strong> تعتمد الدراسة على نظام الساعات المعتمدة، وتتكون من 4 مستويات دراسية.</p>
            <br />
            <p><strong>مادة (٥) - التخرج:</strong> يتطلب التخرج إتمام 134 ساعة للتخصص المنفرد و140 ساعة للمزدوج.</p>
          </>)}

          {renderSection('sec-2', 'الفصل ٢: قبول وقيد الطالب', <>
            <p>يتم القبول وفقاً لقواعد التنسيق والمجلس الأعلى للجامعات.</p>
            <br />
            <p>يجب تقديم ملف كامل بالمستندات الأصلية وصور البطاقة وشهادة الميلاد.</p>
          </>)}

          {renderSection('sec-3', 'الفصل ٣: الإرشاد الأكاديمي', <>
            <p>يُخصص لكل طالب مرشد أكاديمي.</p>
            <br />
            <p>يقوم المرشد بمساعدة الطالب في اختيار المقررات وتسجيل الساعات ومتابعة الـ GPA.</p>
          </>)}

          {renderSection('sec-4', 'الفصل ٤: نظام اختيار البرنامج الدراسي', <ul>
            <li><strong>الرياضيات والفيزياء:</strong> اختيار البرنامج في الفصل الثاني من المستوى الأول.</li>
            <li><strong>الفيزياء الحيوية:</strong> مسار ثابت من المستوى الأول.</li>
            <li><strong>الكيمياء:</strong> اختيار الكيمياء التطبيقية في المستوى الثالث.</li>
          </ul>)}

          {renderSection('sec-5', 'الفصل ٥: إيقاف القيد والأعذار', <>
            <p>الحد الأقصى لإيقاف القيد هو <strong>أربعة فصول دراسية</strong>.</p>
            <br />
            <p>يشترط موافقة مجلس الكلية.</p>
          </>)}

          {renderSection('sec-6', 'الفصل ٦: قواعد التحويل ونقل القيد', <ul>
            <li>يشترط معدل تراكمي لا يقل عن <strong>2.00</strong>.</li>
            <li>لا يجوز التحويل للفرقة النهائية.</li>
            <li>الإعفاء من المقررات المعادلة بحد أقصى 50%.</li>
          </ul>)}

          {renderSection('sec-7', 'الفصل ٧: نظام تأديب الطلاب', <>
            <p>تطبق العقوبات في حالات الغش، انتحال الشخصية، أو الإخلال بالنظام العام.</p>
          </>)}

          {renderSection('sec-8', 'الفصل ٨: الخدمات الطلابية', <>
            <p>تشمل المكتبة العلمية، الرعاية الصحية، الأنشطة الطلابية، وصندوق دعم الطلاب.</p>
          </>)}

          {renderSection('sec-10', 'الفصل ١٠: وثائق شئون الطلاب', <>
            <p>بيان حالة - بيان درجات - شهادة تخرج مؤقتة - أصل الشهادة.</p>
          </>)}

          {renderSection('sec-11', 'الفصل ١١: التربية العسكرية', <>
            <p>مادة إلزامية للنجاح ولا تدخل في حساب المعدل التراكمي.</p>
          </>)}

          {renderSection('sec-12', 'الفصل ١٢: مجالات العمل', <ul>
            <li>الكيمياء: شركات الأدوية والبتروكيماويات</li>
            <li>علوم الحاسب: البرمجيات والذكاء الاصطناعي</li>
            <li>الأحياء: المختبرات الطبية</li>
            <li>الجيولوجيا: شركات البترول والتعدين</li>
          </ul>)}
        </div>

        <div className="footer">كلية العلوم · جامعة عين شمس</div>
      </div>
    </div>
  );
};

export default StudentGuide;
