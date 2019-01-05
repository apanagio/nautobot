$(document).ready(function() {

    // Pagination
    $('select#per_page').change(function() {
        this.form.submit();
    });

    // "Toggle" checkbox for object lists (PK column)
    $('input:checkbox.toggle').click(function() {
        $(this).closest('table').find('input:checkbox[name=pk]').prop('checked', $(this).prop('checked'));

        // Show the "select all" box if present
        if ($(this).is(':checked')) {
            $('#select_all_box').removeClass('hidden');
        } else {
            $('#select_all').prop('checked', false);
        }
    });

    // Uncheck the "toggle" and "select all" checkboxes if an item is unchecked
    $('input:checkbox[name=pk]').click(function (event) {
        if (!$(this).attr('checked')) {
            $('input:checkbox.toggle, #select_all').prop('checked', false);
        }
    });

    // Enable hidden buttons when "select all" is checked
    $('#select_all').click(function() {
        if ($(this).is(':checked')) {
            $('#select_all_box').find('button').prop('disabled', '');
        } else {
            $('#select_all_box').find('button').prop('disabled', 'disabled');
        }
    });

    // Slugify
    function slugify(s, num_chars) {
        s = s.replace(/[^\-\.\w\s]/g, '');          // Remove unneeded chars
        s = s.replace(/^[\s\.]+|[\s\.]+$/g, '');    // Trim leading/trailing spaces
        s = s.replace(/[\-\.\s]+/g, '-');           // Convert spaces and decimals to hyphens
        s = s.toLowerCase();                        // Convert to lowercase
        return s.substring(0, num_chars);           // Trim to first num_chars chars
    }
    var slug_field = $('#id_slug');
    slug_field.change(function() {
        $(this).attr('_changed', true);
    });
    if (slug_field) {
        var slug_source = $('#id_' + slug_field.attr('slug-source'));
        slug_source.on('keyup change', function() {
            if (slug_field && !slug_field.attr('_changed')) {
                slug_field.val(slugify($(this).val(), 50));
            }
        })
    }

    // Bulk edit nullification
    $('input:checkbox[name=_nullify]').click(function() {
        $('#id_' + this.value).toggle('disabled');
    });

    // Set formaction and submit using a link
    $('a.formaction').click(function(event) {
        event.preventDefault();
        var form = $(this).closest('form');
        form.attr('action', $(this).attr('href'));
        form.submit();
    });

    function parseURL(url) {
        var filter_regex = /\{\{([a-z_]+)\}\}/g;
        var match;
        var rendered_url = url;
        var filter_field;
        while (match = filter_regex.exec(url)) {
            filter_field = $('#id_' + match[1]);
            var custom_attr = $('option:selected', filter_field).attr('api-value');
            if (custom_attr) {
                rendered_url = rendered_url.replace(match[0], custom_attr);
            } else if (filter_field.val()) {
                rendered_url = rendered_url.replace(match[0], filter_field.val());
            } else if (filter_field.attr('nullable') == 'true') {
                rendered_url = rendered_url.replace(match[0], 'null');
            }
        }
        return rendered_url
    }

    function colorPickerClassCopy(data, container) {
        console.log("hello");
        if (data.element) {
            $(container).addClass($(data.element).attr("class"));
        }
        return data.text;
    }

    // Color Picker
    $('.netbox-select2-color-picker').select2({
        allowClear: true,
        placeholder: "---------",
        templateResult: colorPickerClassCopy,
        templateSelection: colorPickerClassCopy,
    })

    // Static choice selection
    $('.netbox-select2-static').select2({
        allowClear: true,
        placeholder: "---------",
    })

    // API backed single selection
    // Includes live search and chained fields
    $('.netbox-select2-api').select2({
        allowClear: true,
        placeholder: "---------",
        ajax: {
            delay: 500,
            url: function(params) {
                var element = this[0];
                var url = element.getAttribute("data-url");
                url = parseURL(url);
                if (url.includes("{{")) {
                    // URL is not furry rendered yet, abort the request
                    return null;
                }
                return url;
            },
            data: function(params) {
                var element = this[0];
                // Paging
                var offset = params.page * 50 || 0;
                // Base query params
                var parameters = {
                    q: params.term,
                    brief: 1,
                    limit: 50,
                    offset: offset,
                };
                // filter-for fields from a chain
                var attr_name = "data-filter-for-" + $(element).attr("name");
                var form = $(element).closest('form');
                var filter_for_elements = form.find("select[" + attr_name + "]");
                filter_for_elements.each(function(index, filter_for_element) {
                    var param_name = $(filter_for_element).attr(attr_name);
                    var value = $(filter_for_element).val();
                    if (param_name && value) {
                        parameters[param_name] = $(filter_for_element).val();
                    }
                });
                // Conditional query params
                $.each(element.attributes, function(index, attr){
                    if (attr.name.includes("data-conditional-query-param-")){
                        var conditional = attr.name.split("data-conditional-query-param-")[1].split("__");
                        var field = $("#id_" + conditional[0]);
                        var field_value = conditional[1];
                        if ($('option:selected', field).attr('api-value') === field_value){
                            var _val = attr.value.split("=");
                            parameters[_val[0]] = _val[1];
                        }
                    }
                })
                // Additional query params
                $.each(element.attributes, function(index, attr){
                    if (attr.name.includes("data-additional-query-param-")){
                        var param_name = attr.name.split("data-additional-query-param-")[1]
                        parameters[param_name] = attr.value;
                    }
                })
                return parameters;
            },
            processResults: function (data) {
                var element = this.$element[0];
                var results = $.map(data.results, function (obj) {
                    obj.text = obj.name || obj[element.getAttribute('display-field')];
                    return obj;
                });
                // Check if there are more results to page
                var page = data.next !== null;
                return {
                    results: results,
                    pagination: {
                        more: page
                    }
                };
            }
        }
    });

    // API backed tags
    var tags = $('#id_tags');
    if (tags.length > 0 && tags.val().length > 0){
        tags = $('#id_tags').val().split(/,\s*/);
    } else {
        tags = [];
    }
    tag_objs = $.map(tags, function (tag) {
        return {
            id: tag,
            text: tag,
            selected: true
        }
    });
    // Replace the django issued text input with a select element
    $('#id_tags').replaceWith('<select name="tags" id="id_tags" class="form-control"></select>');
    $('#id_tags').select2({
        tags: true,
        data: tag_objs,
        multiple: true,
        allowClear: true,
        placeholder: "Tags",
        ajax: {
            delay: 250,
            url: "/api/extras/tags/",
            data: function(params) {
                // paging
                var offset = params.page * 50 || 0;
                var parameters = {
                    q: params.term,
                    brief: 1,
                    limit: 50,
                    offset: offset,
                };
                return parameters;
            },
            processResults: function (data) {
                var results = $.map(data.results, function (obj) {
                    return {
                        id: obj.name,
                        text: obj.name
                    }
                });
                // Check if there are more results to page
                var page = data.next !== null;
                return {
                    results: results,
                    pagination: {
                        more: page
                    }
                };
            }
        }
    });
    $('#id_tags').closest('form').submit(function(event){
        // django-taggit can only accept a single comma seperated string value
        var value = $('#id_tags').val();
        if (value.length > 0){
            var final_tags = value.join(', ');
            $('#id_tags').val(null).trigger('change');
            var option = new Option(final_tags, final_tags, true, true);
            $('#id_tags').append(option).trigger('change');
        }
    });
});
