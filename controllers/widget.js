var LTAG = '[html2asWidget]',
	html2as = require('nl.fokkezb.html2as'),
	TI_VERSION = Ti.version;


/**
 * Compares two software version numbers (e.g. "1.7.1" or "1.2b").
 *
 * This function was born in http://stackoverflow.com/a/6832721.
 *
 * @param {string} v1 The first version to be compared.
 * @param {string} v2 The second version to be compared.
 * @param {object} [options] Optional flags that affect comparison behavior:
 * <ul>
 *     <li>
 *         <tt>lexicographical: true</tt> compares each part of the version strings lexicographically instead of
 *         naturally; this allows suffixes such as "b" or "dev" but will cause "1.10" to be considered smaller than
 *         "1.2".
 *     </li>
 *     <li>
 *         <tt>zeroExtend: true</tt> changes the result if one version string has less parts than the other. In
 *         this case the shorter string will be padded with "zero" parts instead of being considered smaller.
 *     </li>
 * </ul>
 * @returns {number|NaN}
 * <ul>
 *    <li>0 if the versions are equal</li>
 *    <li>a negative integer iff v1 < v2</li>
 *    <li>a positive integer iff v1 > v2</li>
 *    <li>NaN if either version string is in the wrong format</li>
 * </ul>
 *
 * @copyright by Jon Papaioannou (["john", "papaioannou"].join(".") + "@gmail.com")
 * @license This function is in the public domain. Do what you want with it, no strings attached.
 */
function _versionCompare(v1, v2, options) {
	var lexicographical = options && options.lexicographical,
		zeroExtend      = options && options.zeroExtend,
		v1parts         = v1.split('.'),
		v2parts         = v2.split('.');

	function _isValidPart(x) {
		return (lexicographical ? /^\d+[A-Za-z]*$/ : /^\d+$/).test(x);
	}

	if (!v1parts.every(_isValidPart) || !v2parts.every(_isValidPart)) {
		return NaN;
	}

	if (zeroExtend) {
		while (v1parts.length < v2parts.length) {
			v1parts.push("0");
		}
		while (v2parts.length < v1parts.length) {
			v2parts.push("0");
		}
	}

	if (!lexicographical) {
		v1parts = v1parts.map(Number);
		v2parts = v2parts.map(Number);
	}

	for (var i = 0; i < v1parts.length; ++i) {
		if (v2parts.length == i) {
			return 1;
		}

		if (v1parts[i] == v2parts[i]) {
			continue;
		}
		else if (v1parts[i] > v2parts[i]) {
			return 1;
		}
		else {
			return -1;
		}
	}

	if (v1parts.length != v2parts.length) {
		return -1;
	}

	return 0;

} // END _versionCompare()


$.applyProperties = function applyProperties(props) {

	if (props.html) {
		$.html = props.html;
	}

	if (props.linkColor) {

		$.linkColor = props.linkColor;

		delete props.linkColor;
	}

	$.label.applyProperties(props);
};

$.on = $.addEventListener = function (name, callback) {
	return $.label.addEventListener(name, callback);
};

$.off = $.removeEventListener = function (name, callback) {
	return $.label.removeEventListener(name, callback);
};

$.trigger = $.fireEvent = function (name, e) {
	return $.label.fireEvent(name, e);
};

$.setHtml = function setHtml(html) {

	if (OS_IOS || (OS_ANDROID && !!~_versionCompare(TI_VERSION, '3.6.0'))) {

		html2as(html, function handle(err, as) {

			if (err) {

				Ti.API.error(LTAG, err);
			}
			else {

				if (_.isString($.linkColor) && !_.isEmpty($.linkColor)) {

					as.attributes.forEach(function (attribute) {

						if (attribute.type === Ti.UI.ATTRIBUTE_LINK) {

							as.addAttribute({

								type:  Ti.UI.ATTRIBUTE_FOREGROUND_COLOR,
								value: $.linkColor,
								range: attribute.range
							});

							as.addAttribute({

								type:  Ti.UI.ATTRIBUTE_UNDERLINE_COLOR,
								value: $.linkColor,
								range: attribute.range
							});
						}
					});
				}

				$.label.attributedString = as;
			}
		});
	}
	else {

		$.label.html = html;
	}
};

$.getHtml = function getHtml() {
	return $.label.html;
};

Object.defineProperty($, 'html', {
	get: $.getHtml,
	set: $.setHtml
});

$.applyProperties($.args);
