define("logoLoadingObject", ["toastmessage"], function() {
    return {
        errorMessage: window.errorMesage,
        files: [],
        index: 0,
        active: false,
        url: '',
        data: {},
        target: '',
        before: function() {
        },
        success: function() {
        },
        error: function() {
        },
        complete: function() {
        },
        init: function(url, data, target, before, success, error, complete) {
            this.url = url;
            this.data = data;
            this.before = before;
            this.success = success;
            this.error = error;
            this.complete = complete;
            this.target = target;
        },
        getPreviewParams: function(image, min_w, min_h) {
            var width = image.width;
            var height = image.height;

            var w = width;
            var h = height;

            var k = w / h;
            var m = min_w / min_h;

            if (k >= m) {
                min_h = h;
                min_w = m * min_h;
            }
            else {
                min_w = w;
                min_h = min_w / m;
            }

            var x = w / 2 - min_w / 2;
            var y = h / 2 - min_h / 2;

            return {x: x, y: y, min_w: min_w, min_h: min_h};
        },
        // Добавляем файл в очередь загрузки
        add: function(file) {
            this.files.push(file);
            var that = this;

            // Создаем превью загружаемой фотографии
            if (/^image/.test(file.type)) {
                FileAPI.readAsImage(file, function(evt) {

                    //var params = that.getPreviewParams(evt.result, 283, 283);
                    var w = evt.result.width,
                            h = evt.result.height,
                            k = w / h
                    rw = 170,
                            rh = rw / k;

                    FileAPI.Image(file)
                            //.crop(params.x, params.y, params.min_w, params.min_h)
                            .resize(rw, rh).rotate('auto').get(function(err, img) {
                        if (!err) {
                            that.before(img);
                        }
                    });
                });
            }
        },
        // Вызывает метод загрузки файла
        start: function() {
            if (!this.active && (this.active = this.files.length > this.index)) {
                this.upload(this.files[this.index]);
            }
        },
        // Метод загрузки файла 
        upload: function(file) {
            if (file && !file.no_load) {

                var that = this;

                file.xhr = FileAPI.upload({
                    url: that.url,
                    data: that.data,
                    files: {file: file},
                    imageOriginal: true, // Передавать-ли на сервер оригинальное изображение
                    imageAutoOrientation: true,
                    // Пропорциональная трансформация изображений
                    imageTransform: {
                        'max': {
                            maxWidth: 700,
                            maxHeight: 600
                        },
                        'med': {
                            maxWidth: 283,
                            maxHeight: 283
                        },
                        'small': {
                            maxWidth: 150,
                            maxHeight: 150
                        },
                        'preview': function(image, transform) {
                            var params = that.getPreviewParams(image, 150, 93);
                            transform.crop(params.x, params.y, params.min_w, params.min_h)
                                    .resize(150, 93)
                                    .rotate('auto');
                        },
                        'medium_square': function(image, transform) {
                            var params = that.getPreviewParams(image, 150, 150);
                            transform.crop(params.x, params.y, params.min_w, params.min_h)
                                    .resize(150, 150)
                                    .rotate('auto');
                        },
                        'small_square': function(image, transform) {
                            var params = that.getPreviewParams(image, 60, 60);
                            transform.crop(params.x, params.y, params.min_w, params.min_h)
                                    .resize(60, 60)
                                    .rotate('auto');
                        }
                    },
                    upload: function() {
                        //
                    },
                    progress: function(evt) {
                        //
                    },
                    complete: function(err, xhr) {

                        if (!err) {
                            that.success(JSON.parse(xhr.responseText), 200);
                        }
                        else {
                            that.error(xhr, 500);
                            that.errorMessage('Возникла ошибка в процессе загрузки изображения.');
                        }
                        that.complete(xhr, 500);
                        that.index++;
                        that.active = false;

                        //that.start();
                    }
                });
            }
            else {
                var image = that.getElement(file);
                image.remove();

                this.index++;
                this.active = false;

                this.start();
            }
        },
        // Возвращает файл по его идентификатору
        getFileById: function(id) {
            var i = this.files.length;
            while (i--) {
                if (FileAPI.uid(this.files[i]) == id) {
                    return this.files[i];
                }
            }
        },
        // Отменяет загрузку файла
        abort: function(id) {
            var file = this.getFileById(id);
            // Помечаем файл для отмены его загрузки
            file.no_load = true;
            var image = this.getElement(file);
            // Скрываем его для последующего удаления из ДОМа
            image.hide();
            if (file.xhr) {
                file.xhr.abort();
            }
        },
        // Возвращает объект элемента
        getElement: function(file, selector) {
            throw new Exception("Метод не реализован.");
        }
    };
});
