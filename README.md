# v14 Ticket Web

Bu proje, Discord.js v14 kullanarak yapılmış bir ticket (destek) sistemi ve web arayüzü içerir. Ticket sistemi, kullanıcıların destek talepleri oluşturmasına ve yöneticilerin bu talepleri yönetmesine olanak sağlar. Web arayüzü ise ticket'ların görüntülenmesini ve yönetilmesini sağlar.

## Özellikler

- Ticket oluşturma ve yönetme
- Ticket mesajları ve medya içeriklerini görüntüleme
- Ticket'ı kapatma ve transkript oluşturma
- Web arayüzü üzerinden ticket işlemleri yapma
- Rol bazlı erişim kontrolü

## Gereksinimler

- Node.js v18 veya üstü
- Discord.js v14
- `express` ve `cors` kütüphaneleri

## Kurulum

1. **Depoyu klonlayın:**

    ```bash
    git clone https://github.com/militancc/v14-ticket-web.git
    cd v14-ticket-web
    ```

2. **Gerekli paketleri yükleyin:**

    ```bash
    npm install
    ```

3. **Yapılandırma dosyasını düzenleyin:**

    `minik.json` dosyasındaki ayarları kendi Discord botunuzun bilgileriyle güncelleyin.

4. **Botu başlatın:**

    ```bash
    node minik.js
    ```

## Kullanım

- `/create-ticket` komutuyla yeni bir ticket oluşturabilirsiniz.
- Web arayüzünden mevcut ticket'ları görüntüleyebilir, isimlerini değiştirebilir, kaydedebilir ve kapatabilirsiniz.

## Web Arayüzü

Web arayüzüne erişim için sunucu URL'sine gidin ve ilgili yolları kullanarak ticket'larınızı yönetin:

- `/tickets` - Ticket'ları listeleme
- `/messages/:channelId` - Ticket mesajlarını görüntüleme

## Erişim Kontrolü

Web arayüzüne erişimi sınırlamak için belirli bir role sahip olmanız gerekmektedir. Role sahip olmayan kullanıcılar sayfayı göremez.

## Katkıda Bulunma

Katkılarınız için lütfen bir pull request gönderin. Herhangi bir sorun veya öneriniz varsa, lütfen bir issue açın.

## Lisans

Bu proje [MIT Lisansı](LICENSE) altında lisanslanmıştır.
