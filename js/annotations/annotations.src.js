/**
 * (c) 2009-2017 Highsoft, Black Label
 *
 * License: www.highcharts.com/license
 */
'use strict';
import H from '../parts/Globals.js';
import '../parts/Utilities.js';
import '../parts/Chart.js';
import controllableMixin from './controllable/controllableMixin.js';
import ControllableRect from './controllable/ControllableRect.js';
import ControllableCircle from './controllable/ControllableCircle.js';
import ControllablePath from './controllable/ControllablePath.js';
import ControllableImage from './controllable/ControllableImage.js';
import ControllableLabel from './controllable/ControllableLabel.js';
import eventEmitterMixin from './eventEmitterMixin.js';
import MockPoint from './MockPoint.js';
import ControlPoint from './ControlPoint.js';

var merge = H.merge,
    addEvent = H.addEvent,
    each = H.each,
    defined = H.defined,
    erase = H.erase,
    find = H.find,
    pick = H.pick,
    destroyObjectProperties = H.destroyObjectProperties;

/* *********************************************************************
 *
 * ANNOTATION
 *
 ******************************************************************** */

/**
 * @typedef {
 *          Annotation.ControllableCircle|
 *          Annotation.ControllableImage|
 *          Annotation.ControllablePath|
 *          Annotation.ControllableRect
 *          }
 *          Annotation.Shape
 */

/**
 * @typedef {Annotation.ControllableLabel} Annotation.Label
 */

/**
 * An annotation class which serves as a container for items like labels or
 * shapes. Created items are positioned on the chart either by linking them to
 * existing points or created mock points
 *
 * @class
 * @mixes Annotation.controllableMixin
 * @mixes Annotation.eventEmitterMixin
 *
 * @param {Highcharts.Chart} chart a chart instance
 * @param {AnnotationOptions} options the options object
 */
var Annotation = H.Annotation = function (chart, options) {

    /**
     * The chart that the annotation belongs to.
     *
     * @type {Highcharts.Chart}
     */
    this.chart = chart;

    /**
     * The array of points which defines the annotation.
     *
     * @type {Array<Annotation.PointLike>}
     */
    this.points = [];

    /**
     * The array of control points.
     *
     * @type {Array<Annotation.ControlPoint>}
     */
    this.controlPoints = [];

    /**
     * The array of labels which belong to the annotation.
     *
     * @type {Array<Annotation.Label>}
     */
    this.labels = [];

    /**
     * The array of shapes which belong to the annotation.
     *
     * @type {Array<Annotation.Shape>}
     */
    this.shapes = [];

    /**
     * The options for the annotations.
     *
     * @type {AnnotationOptions}
     */
    // this.options = merge(this.defaultOptions, userOptions);
    this.options = options;

    /**
     * The callback that reports to the overlapping-labels module which
     * labels it should account for.
     *
     * @name labelCollector
     * @memberOf Annotation#
     * @type {Function}
     */

    /**
     * The group svg element.
     *
     * @name group
     * @memberOf Annotation#
     * @type {Highcharts.SVGElement}
     */

    /**
     * The group svg element of the annotation's shapes.
     *
     * @name shapesGroup
     * @memberOf Annotation#
     * @type {Highcharts.SVGElement}
     */

    /**
     * The group svg element of the annotation's labels.
     *
     * @name labelsGroup
     * @memberOf Annotation#
     * @type {Highcharts.SVGElement}
     */

    this.init(chart, options);
};


merge(
    true,
    Annotation.prototype,
    controllableMixin,
    eventEmitterMixin, /** @lends Annotation# */ {
        /**
         * A basic type of an annotation. It allows to add custom labels
         * or shapes. The items  can be tied to points, axis coordinates
         * or chart pixel coordinates.
         *
         * @private
         * @type {Object}
         * @sample highcharts/annotations/basic/
         *         Basic annotations
         * @sample highcharts/demo/annotations/
         *         Advanced annotations
         * @sample highcharts/css/annotations
         *         Styled mode
         * @sample highcharts/annotations-advanced/controllable
         *          Controllable items
         * @sample {highstock} stock/annotations/fibonacci-retracements
         *         Custom annotation, Fibonacci retracement
         * @since 6.0.0
         * @optionparent annotations.base
         */
        defaultOptions: {
            /**
             * Whether the annotation is visible.
             *
             * @sample highcharts/annotations/visible/
             *         Set annotation visibility
             */
            visible: true,

             /**
             * Allow an annotation to be draggable by a user. Possible
             * values are `"x"`, `"xy"`, `"y"` and `""` (disabled).
             *
             * @type {string}
             * @validvalue ["x", "xy", "y", ""]
             */
            draggable: 'xy',

            /**
             * Options for annotation's labels. Each label inherits options
             * from the labelOptions object. An option from the labelOptions
             * can be overwritten by config for a specific label.
             */
            labelOptions: {

                /**
                 * The alignment of the annotation's label. If right,
                 * the right side of the label should be touching the point.
                 *
                 * @validvalue ["left", "center", "right"]
                 * @sample highcharts/annotations/label-position/
                 *         Set labels position
                 */
                align: 'center',

                /**
                 * Whether to allow the annotation's labels to overlap.
                 * To make the labels less sensitive for overlapping,
                 * the can be set to 0.
                 *
                 * @sample highcharts/annotations/tooltip-like/
                 *         Hide overlapping labels
                 */
                allowOverlap: false,

                /**
                 * The background color or gradient for the annotation's label.
                 *
                 * @type {Color}
                 * @sample highcharts/annotations/label-presentation/
                 *         Set labels graphic options
                 */
                backgroundColor: 'rgba(0, 0, 0, 0.75)',

                /**
                 * The border color for the annotation's label.
                 *
                 * @type {Color}
                 * @sample highcharts/annotations/label-presentation/
                 *         Set labels graphic options
                 */
                borderColor: 'black',

                /**
                 * The border radius in pixels for the annotaiton's label.
                 *
                 * @sample highcharts/annotations/label-presentation/
                 *         Set labels graphic options
                 */
                borderRadius: 3,

                /**
                 * The border width in pixels for the annotation's label
                 *
                 * @sample highcharts/annotations/label-presentation/
                 *         Set labels graphic options
                 */
                borderWidth: 1,

                /**
                 * A class name for styling by CSS.
                 *
                 * @sample highcharts/css/annotations
                 *         Styled mode annotations
                 * @since 6.0.5
                 */
                className: '',

                /**
                 * Whether to hide the annotation's label
                 * that is outside the plot area.
                 *
                 * @sample highcharts/annotations/label-crop-overflow/
                 *         Crop or justify labels
                 */
                crop: false,

                /**
                 * The label's pixel distance from the point.
                 *
                 * @type {number}
                 * @sample highcharts/annotations/label-position/
                 *         Set labels position
                 * @default undefined
                 * @apioption annotations.base.labelOptions.distance
                 */

                /**
                 * A [format](https://www.highcharts.com/docs/chart-concepts/labels-and-string-formatting) string for the data label.
                 *
                 * @type {string}
                 * @see    [plotOptions.series.dataLabels.format](
                 *         plotOptions.series.dataLabels.format.html)
                 * @sample highcharts/annotations/label-text/
                 *         Set labels text
                 * @default undefined
                 * @apioption annotations.base.labelOptions.format
                 */

                /**
                 * Alias for the format option.
                 *
                 * @type {string}
                 * @see [format](annotations.labelOptions.format.html)
                 * @sample highcharts/annotations/label-text/
                 *         Set labels text
                 * @default undefined
                 * @apioption annotations.base.labelOptions.text
                 */

                /**
                 * Callback JavaScript function to format
                 * the annotation's label. Note that if a `format` or `text`
                 * are defined, the format or text take precedence and
                 * the formatter is ignored. `This` refers to a * point object.
                 *
                 * @type {function}
                 * @sample highcharts/annotations/label-text/
                 *         Set labels text
                 * @default function () {
                 *  return defined(this.y) ? this.y : 'Annotation label';
                 * }
                 */
                formatter: function () {
                    return defined(this.y) ? this.y : 'Annotation label';
                },

                /**
                 * How to handle the annotation's label that flow
                 * outside the plot area. The justify option aligns the label
                 * inside the plot area.
                 *
                 * @validvalue ["none", "justify"]
                 * @sample highcharts/annotations/label-crop-overflow/
                 *         Crop or justify labels
                 **/
                overflow: 'justify',

                /**
                 * When either the borderWidth or the backgroundColor is set,
                 * this is the padding within the box.
                 *
                 * @sample highcharts/annotations/label-presentation/
                 *         Set labels graphic options
                 */
                padding: 5,

                /**
                 * The shadow of the box. The shadow can be
                 * an object configuration containing
                 * `color`, `offsetX`, `offsetY`, `opacity` and `width`.
                 *
                 * @type {Boolean|Object}
                 * @sample highcharts/annotations/label-presentation/
                 *         Set labels graphic options
                 */
                shadow: false,

                /**
                 * The name of a symbol to use for the border around the label.
                 * Symbols are predefined functions on the Renderer object.
                 *
                 * @type {string}
                 * @sample highcharts/annotations/shapes/
                 *         Available shapes for labels
                 */
                shape: 'callout',

                /**
                 * Styles for the annotation's label.
                 *
                 * @type {CSSObject}
                 * @sample highcharts/annotations/label-presentation/
                 *         Set labels graphic options
                 * @see    [plotOptions.series.dataLabels.style](
                 *         plotOptions.series.dataLabels.style.html)
                 */
                style: {
                    fontSize: '11px',
                    fontWeight: 'normal',
                    color: 'contrast'
                },

                /**
                 * Whether to [use HTML](http://www.highcharts.com/docs/chart-concepts/labels-and-string-formatting#html)
                 * to render the annotation's label.
                 *
                 * @type {boolean}
                 * @default false
                 */
                useHTML: false,

                /**
                 * The vertical alignment of the annotation's label.
                 *
                 * @type {string}
                 * @validvalue ["top", "middle", "bottom"]
                 * @sample highcharts/annotations/label-position/
                 *         Set labels position
                 */
                verticalAlign: 'bottom',

                /**
                 * The x position offset of the label relative to the point.
                 * Note that if a `distance` is defined, the distance takes
                 * precedence over `x` and `y` options.
                 *
                 * @sample highcharts/annotations/label-position/
                 *         Set labels position
                 */
                x: 0,

                /**
                 * The y position offset of the label relative to the point.
                 * Note that if a `distance` is defined, the distance takes
                 * precedence over `x` and `y` options.
                 *
                 * @sample highcharts/annotations/label-position/
                 *         Set labels position
                 */
                y: -16
            },

            /**
             * An array of labels for the annotation. For options that apply to
             * multiple labels, they can be added to the
             * [labelOptions](annotations.labelOptions.html).
             *
             * @type {Array<Object>}
             * @extends annotations.base.labelOptions
             * @apioption annotations.base.labels
             */

            /**
             * This option defines the point to which the label
             * will be connected.
             * It can be either the point which exists in the series - it is
             * referenced by the point's id - or a new point with defined x, y
             * properies and optionally axes.
             *
             * @type {string|MockPointOptions}
             * @sample highcharts/annotations/mock-point/
             *         Attach annotation to a mock point
             * @apioption annotations.base.labels.point
             */

            /**
             * The x position of the point. Units can be either in axis
             * or chart pixel coordinates.
             *
             * @type {number}
             * @apioption annotations.base.labels.point.x
             */

            /**
             * The y position of the point. Units can be either in axis
             * or chart pixel coordinates.
             *
             * @type {number}
             * @apioption annotations.base.labels.point.y
             */

            /**
             * This number defines which xAxis the point is connected to.
             * It refers to either the axis id or the index of the axis
             * in the xAxis array. If the option is not configured or
             * the axis is not found the point's
             * x coordinate refers to the chart pixels.
             *
             * @type {number|string}
             * @apioption annotations.base.labels.point.xAxis
             */

            /**
             * This number defines which yAxis the point is connected to.
             * It refers to either the axis id or the index of the axis
             * in the yAxis array. If the option is not configured or
             * the axis is not found the point's
             * y coordinate refers to the chart pixels.
             *
             * @type {number|string}
             * @apioption annotations.base.labels.point.yAxis
             */



            /**
             * An array of shapes for the annotation. For options that apply to
             * multiple shapes, then can be added to the
             * [shapeOptions](annotations.shapeOptions.html).
             *
             * @type {Array<Object>}
             * @extends annotations.base.shapeOptions
             * @apioption annotations.base.shapes
             */

            /**
             * This option defines the point to which the shape will be
             * connected.
             * It can be either the point which exists in the series - it is
             * referenced by the point's id - or a new point with defined x, y
             * properties and optionally axes.
             *
             * @type {string|MockPointOptions}
             * @extends annotations.base.labels.point
             * @apioption annotations.base.shapes.point
             */

            /**
             * An array of points for the shape. This option is available
             * for shapes which can use multiple points such as path.
             * A point can be either a point object or a point's id.
             *
             * @type {Array<string|Highcharts.MockPoint.Options>}
             * @see [annotations.shapes.point](annotations.shapes.point.html)
             * @apioption annotations.base.shapes.points
             */

            /**
             * Id of the marker which will be drawn at the final
             * vertex of the path.
             * Custom markers can be defined in defs property.
             *
             * @type {string}
             * @see [defs.markers](defs.markers.html)
             * @sample highcharts/annotations/custom-markers/
             *         Define a custom marker for annotations
             * @apioption annotations.base.shapes.markerEnd
             */

            /**
             * Id of the marker which will be drawn at the first
             * vertex of the path.
             * Custom markers can be defined in defs property.
             *
             * @type {string}
             * @see [defs.markers](defs.markers.html)
             * @sample {highcharts} highcharts/annotations/custom-markers/
             *         Define a custom marker for annotations
             * @apioption annotations.base.shapes.markerStart
             */


            /**
             * Options for annotation's shapes. Each shape inherits options
             * from the shapeOptions object. An option from the shapeOptions
             * can be overwritten by config for a specific shape.
             *
             * @type {Object}
             */
            shapeOptions: {
                /**
                 * The width of the shape.
                 *
                 * @type {number}
                 * @sample highcharts/annotations/shape/
                 *         Basic shape annotation
                 * @apioption annotations.base.shapeOptions.width
                 **/

                /**
                 * The height of the shape.
                 *
                 * @type {number}
                 * @sample highcharts/annotations/shape/
                 *         Basic shape annotation
                 * @apioption annotations.base.shapeOptions.height
                 */

                /**
                 * The color of the shape's stroke.
                 *
                 * @type {Color}
                 * @sample highcharts/annotations/shape/
                 *         Basic shape annotation
                 */
                stroke: 'rgba(0, 0, 0, 0.75)',

                /**
                 * The pixel stroke width of the shape.
                 *
                 * @sample highcharts/annotations/shape/
                 *         Basic shape annotation
                 */
                strokeWidth: 1,

                /**
                 * The color of the shape's fill.
                 *
                 * @type {Color}
                 * @sample highcharts/annotations/shape/
                 *         Basic shape annotation
                 */
                fill: 'rgba(0, 0, 0, 0.75)',

                /**
                 * The type of the shape, e.g. circle or rectangle.
                 *
                 * @type {string}
                 * @sample highcharts/annotations/shape/
                 *         Basic shape annotation
                 * @default 'rect'
                 * @apioption annotations.base.shapeOptions.type
                 */

                /**
                 * The radius of the shape.
                 *
                 * @sample highcharts/annotations/shape/
                 *         Basic shape annotation
                 */
                r: 0
            },

            /**
             * Options for annotation's control points. Each control point
             * inherits options from controlPointOptions object.
             * Options from the controlPointOptions can be overwritten
             * by options in a specific control point.
             *
             * @type {Annotation.ControlPoint.Options}
             * @apioption annotations.base.controlPointOptions
             */
            controlPointOptions: {
                symbol: 'circle',
                width: 10,
                height: 10,
                style: {
                    stroke: 'black',
                    'stroke-width': 2,
                    fill: 'white'
                },
                visible: false,

                /**
                 * @function {Annotation.ControlPoint.Positioner}
                 * @apioption annotations.base.controlPointOptions.positioner
                 */


                events: {}
            },


            /**
             * @type {Object}
             */
            events: {},

            /**
             * The Z index of the annotation.
             *
             * @type {number}
             * @default 6
             */
            zIndex: 6
        },

        /**
         * Initialize the annotation.
         *
         * @param {Highcharts.Chart} - the chart
         * @param {AnnotationOptions} - the user options for the annotation
         */
        init: function () {
            this.linkPoints();
            this.addControlPoints();
            this.addShapes();
            this.addLabels();
            this.setLabelCollector();
        },

        addShapes: function () {
            each(this.options.shapes || [], function (shapeOptions, i) {
                var shape = this.initShape(shapeOptions);

                this.options.shapes[i] = shape.options;
            }, this);
        },

        addLabels: function () {
            each(this.options.labels || [], function (labelOptions, i) {
                var label = this.initLabel(labelOptions);

                this.options.labels[i] = label.options;
            }, this);
        },

        setLabelCollector: function () {
            var annotation = this;

            annotation.labelCollector = function () {
                return H.reduce(
                    annotation.labels,
                    function (labels, label) {
                        if (!label.options.allowOverlap) {
                            labels.push(label.graphic);
                        }

                        return labels;
                    },
                    []
                );
            };

            annotation.chart.labelCollectors.push(
                annotation.labelCollector
            );
        },

        /**
         * Set an annotation options.
         *
         * @param {AnnotationOptions} - user options for an annotation
         */
        setOptions: function (userOptions) {
            this.options = merge(this.defaultOptions, userOptions);
        },

        redraw: function (animation) {
            this.linkPoints();

            if (!this.graphic) {
                this.render();
            }

            this.redrawItems(this.shapes, animation);
            this.redrawItems(this.labels, animation);

            controllableMixin.redraw.call(this, animation);
        },

        /**
         * @param {Array<(Annotation.Label|Annotation.Shape)>} items
         * @param {boolean} [animation]
         */
        redrawItems: function (items, animation) {
            var i = items.length;

            // needs a backward loop
            // labels/shapes array might be modified
            // due to destruction of the item
            while (i--) {
                this.redrawItem(items[i], animation);
            }
        },

        render: function () {
            var renderer = this.chart.renderer;

            this.graphic = renderer
                .g('annotation')
                .attr({
                    zIndex: this.options.zIndex,
                    visibility: this.options.visible ?
                    'visible' :
                    'hidden'
                })
                .add();

            this.shapesGroup = renderer
                .g('annotation-shapes')
                .add(this.graphic)
                .clip(this.chart.plotBoxClip);

            this.labelsGroup = renderer
                .g('annotation-labels')
                .attr({
                    // hideOverlappingLabels requires translation
                    translateX: 0,
                    translateY: 0
                })
                .add(this.graphic);

            this.addEvents();

            controllableMixin.render.call(this);
        },

        /**
         * Set the annotation's visibility.
         *
         * @param {Boolean} [visible] - Whether to show or hide an annotation.
         * If the param is omitted, the annotation's visibility is toggled.
         */
        setVisibility: function (visibility) {
            var options = this.options,
                visible = pick(visibility, !options.visible);

            this.graphic.attr(
                'visibility',
                visible ? 'visible' : 'hidden'
            );

            if (!visible) {
                this.setControlPointsVisibility(false);
            }

            options.visible = visible;
        },

        setControlPointsVisibility: function (visible) {
            var setItemControlPointsVisibility = function (item) {
                item.setControlPointsVisibility(visible);
            };

            controllableMixin.setControlPointsVisibility.call(
                this,
                visible
            );

            each(this.shapes, setItemControlPointsVisibility);
            each(this.labels, setItemControlPointsVisibility);
        },

        /**
         * Destroy the annotation. This function does not touch the chart
         * that the annotation belongs to (all annotations are kept in
         * the chart.annotations array) - it is recommended to use
         * {@link Highcharts.Chart#removeAnnotation} instead.
         */
        destroy: function () {
            var chart = this.chart,
                destroyItem = function (item) {
                    item.destroy();
                };

            each(this.labels, destroyItem);
            each(this.shapes, destroyItem);

            erase(chart.labelCollectors, this.labelCollector);

            eventEmitterMixin.destroy.call(this);
            controllableMixin.destroy.call(this);

            destroyObjectProperties(this, chart);
        },

        update: function (userOptions) {
            var chart = this.chart,
                options = H.merge(true, this.options, userOptions);

            this.destroy();
            this.constructor(chart, options);

            this.redraw();
        },

        /* *************************************************************
         * ITEM SECTION
         * Contains methods for handling a single item in an annotation
         **************************************************************** */

        /**
         * Initialisation of a single shape
         *
         * @param {Object} shapeOptions - a confg object for a single shape
         **/
        initShape: function (shapeOptions) {
            var options = merge(
                this.options.shapeOptions,
                {
                    controlPointOptions: this.options.controlPointOptions
                },
                shapeOptions
            ),
                shape = new Annotation.shapesMap[options.type](
                    this,
                    options
                );

            shape.itemType = 'shape';

            this.shapes.push(shape);

            return shape;
        },

        /**
         * Initialisation of a single label
         *
         * @param {Object} labelOptions
         **/
        initLabel: function (labelOptions) {
            var options = merge(
                this.options.labelOptions,
                {
                    controlPointOptions: this.options.controlPointOptions
                },
                labelOptions
            ),
                label = new ControllableLabel(
                    this,
                    options
                );

            label.itemType = 'label';

            this.labels.push(label);

            return label;
        },

        /**
         * Redraw a single item.
         *
         * @param {Annotation.Label|Annotation.Shape} item
         * @param {boolean} [animation]
         */
        redrawItem: function (item, animation) {
            item.linkPoints();
            if (!item.shouldBeDrawn()) {
                this.destroyItem(item);
            } else {
                if (!item.graphic) {
                    this.renderItem(item);
                }

                item.redraw(
                    H.pick(animation, true) && item.graphic.placed
                );
            }
        },

        /**
         * Destroy a single item.
         *
         * @param {Annotation.Label|Annotation.Shape} item
         */
        destroyItem: function (item) {
            // erase from shapes or labels array
            erase(this[item.itemType + 's'], item);
            item.destroy();
        },

        /*
         * @private
         */
        renderItem: function (item) {
            item.render(
                item.itemType === 'label' ?
                this.labelsGroup :
                this.shapesGroup
            );
        }
    });

/**
 * An object uses for mapping between a shape type and a constructor.
 * To add a new shape type extend this object with type name as a key
 * and a constructor as its value.
 **/
Annotation.shapesMap = {
    'rect': ControllableRect,
    'circle': ControllableCircle,
    'path': ControllablePath,
    'image': ControllableImage
};

Annotation.types = {};

Annotation.MockPoint = MockPoint;
Annotation.ControlPoint = ControlPoint;

H.extendAnnotation = function (
    Constructor,
    BaseConstructor,
    prototype,
    defaultOptions
) {
    BaseConstructor = BaseConstructor || Annotation;

    merge(
        true,
        Constructor.prototype,
        BaseConstructor.prototype,
        prototype
    );

    Constructor.prototype.defaultOptions = merge(
        Constructor.prototype.defaultOptions,
        defaultOptions || {}
    );
};

/* *********************************************************************
 *
 * EXTENDING CHART PROTOTYPE
 *
 ******************************************************************** */

H.extend(H.Chart.prototype, /** @lends Highcharts.Chart# */ {
    initAnnotation: function (userOptions) {
        var Constructor =
            Annotation.types[userOptions.type] || Annotation,
            options = H.merge(
                Constructor.prototype.defaultOptions,
                userOptions
            ),
            annotation = new Constructor(this, options);

        this.annotations.push(annotation);

        return annotation;
    },

    /**
     * Add an annotation to the chart after render time.
     *
     * @param  {AnnotationOptions} options
     *         The annotation options for the new, detailed annotation.
     * @param {boolean} [redraw]
     *
     * @return {Highcharts.Annotation} - The newly generated annotation.
     */
    addAnnotation: function (userOptions, redraw) {
        var annotation = this.initAnnotation(userOptions);

        this.options.annotations.push(annotation.options);

        if (pick(redraw, true)) {
            annotation.redraw();
        }

        return annotation;
    },

    /**
     * Remove an annotation from the chart.
     *
     * @param {String} id - The annotation's id.
     */
    removeAnnotation: function (id) {
        var annotations = this.annotations,
            annotation = find(annotations, function (annotation) {
                return annotation.options.id === id;
            });

        if (annotation) {
            erase(this.options.annotations, annotation.options);
            erase(annotations, annotation);
            annotation.destroy();
        }
    },

    drawAnnotations: function () {
        this.plotBoxClip.attr(this.plotBox);

        each(this.annotations, function (annotation) {
            annotation.redraw();
        });
    }
});


H.Chart.prototype.callbacks.push(function (chart) {
    chart.annotations = [];

    if (!chart.options.annotations) {
        chart.options.annotations = [];
    }

    chart.plotBoxClip = this.renderer.clipRect(this.plotBox);

    chart.controlPointsGroup = chart.renderer
        .g('control-points')
        .attr({ zIndex: 99 })
        .clip(chart.plotBoxClip)
        .add();

    each(chart.options.annotations, function (annotationOptions, i) {
        var annotation = chart.initAnnotation(annotationOptions);

        chart.options.annotations[i] = annotation.options;
    });

    chart.drawAnnotations();
    addEvent(chart, 'redraw', chart.drawAnnotations);
    addEvent(chart, 'destroy', function () {
        chart.plotBoxClip.destroy();
        chart.controlPointsGroup.destroy();
    });
});
