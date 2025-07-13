import React from 'react'
import "./Contact.css"

const Contact = () => {
  return (
    <section className="contact">
        <div className="contact-top">
            <div className="contact-map">
                <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3008.9633698339308!2d28.929441087738052!3d41.04793012296828!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14cab1d021adf417%3A0xba3a3fdfdbb5f5d!2sEy%C3%BCp%20Sultan%20Camii!5e0!3m2!1str!2str!4v1665091191675!5m2!1str!2str"
                    width="100%" height="500" style={{
                        border: "0"
                    }} allowFullScreen="" loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"></iframe>
            </div>
        </div>
        <div className="contact-bottom">
            <div className="container">
                <div className="contact-titles">
                    <h4>Bizimle iletişime geçin</h4>
                    <h2>İletişime Geçin</h2>
                    <p>Siz değerli müşterilerimizin ihtiyaçlarını en iyi şekilde karşılamak için çalışıyoruz. 
                        Bize ulaşarak, ürünlerimiz ve hizmetlerimiz hakkında daha fazla bilgi alabilir, 
                        özel tekliflerimizden yararlanabilir ve uzman ekibimizden destek alabilirsiniz.</p>
                </div>
                <div className="contact-elements">
                    <form className="contact-form">
                        <div className="">
                            <label>
                                Adınız
                                <span>*</span>
                            </label>
                            <input type="text" required />
                        </div>
                        <div className="">
                            <label>
                                Email Adresiniz
                                <span>*</span>
                            </label>
                            <input type="text" required />
                        </div>
                        <div className="">
                            <label>
                                Konu
                                <span>*</span>
                            </label>
                            <input type="text" required />
                        </div>
                        <div className="">
                            <label>
                                Mesajınız
                                <span>*</span>
                            </label>
                            <textarea id="author" name="author" type="text" defaultValue="" size="30" required=""></textarea>
                        </div>
                        <button className="btn btn-sm form-button">Mesajı Gönder</button>
                    </form>
                    <div className="contact-info">
                        <div className="contact-info-item">
                            <div className="contact-info-texts">
                                <strong> Dream Filtre Merkez</strong>
                                <p className="contact-street">
                                  Maslak Mah. Atatürk Oto Sanayi Sitesi 2. Kısım No:45, Sarıyer/İstanbul
                                </p>
                                <a href="tel:+902129999999">Telefon: 0212 999 99 99</a>
                                <a href="mailto:info@dreamfiltre.com">Email: info@dreamfiltre.com</a>
                            </div>
                        </div>
                        <div className="contact-info-item">
                            <div className="contact-info-texts">
                                <strong> Çalışma Saatleri</strong>
                                <p className="contact-date">
                                    Pazartesi - Cumartesi : 09.00 - 17.00</p>
                                <p>Pazar : Kapalı</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
  )
}

export default Contact