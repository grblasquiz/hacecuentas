/* global wp */
( function () {
	'use strict';

	var el = wp.element.createElement;
	var Fragment = wp.element.Fragment;
	var useState = wp.element.useState;
	var useEffect = wp.element.useEffect;
	var useBlockProps = wp.blockEditor.useBlockProps;
	var InspectorControls = wp.blockEditor.InspectorControls;
	var c = wp.components;
	var __ = wp.i18n.__;

	var ORIGIN = 'https://hacecuentas.com';

	function Picker( props ) {
		// Selector buscable cuando la lista cargó; input manual si falló.
		if ( props.status === 'loading' ) {
			return el( c.Spinner );
		}
		if ( props.status === 'ready' ) {
			return el( c.ComboboxControl, {
				label: props.label,
				value: props.slug,
				options: props.options,
				onChange: function ( v ) {
					props.onChange( v || '' );
				},
				allowReset: true,
			} );
		}
		return el( c.TextControl, {
			label: __( 'Slug de la calculadora', 'hacecuentas-calculadoras' ),
			help: __(
				'No pudimos cargar la lista. Pegá el slug a mano (ej: calculadora-imc).',
				'hacecuentas-calculadoras'
			),
			value: props.slug,
			onChange: props.onChange,
		} );
	}

	function Edit( props ) {
		var attributes = props.attributes;
		var setAttributes = props.setAttributes;
		var slug = attributes.slug;
		var height = attributes.height || 640;
		var blockProps = useBlockProps();

		var optionsState = useState( [] );
		var options = optionsState[ 0 ];
		var setOptions = optionsState[ 1 ];
		var statusState = useState( 'loading' );
		var status = statusState[ 0 ];
		var setStatus = statusState[ 1 ];

		useEffect( function () {
			var alive = true;
			fetch( ORIGIN + '/api/calcs-slim.json' )
				.then( function ( r ) {
					return r.ok ? r.json() : Promise.reject( r.status );
				} )
				.then( function ( data ) {
					if ( ! alive ) {
						return;
					}
					var opts = ( Array.isArray( data ) ? data : [] )
						.filter( function ( x ) {
							return ! x.l; // sólo calcs AR (tienen /embed/<slug>)
						} )
						.map( function ( x ) {
							return { value: x.s, label: x.t || x.s };
						} );
					setOptions( opts );
					setStatus( 'ready' );
				} )
				.catch( function () {
					if ( alive ) {
						setStatus( 'error' );
					}
				} );
			return function () {
				alive = false;
			};
		}, [] );

		var setSlug = function ( v ) {
			setAttributes( { slug: v } );
		};

		var inspector = el(
			InspectorControls,
			{},
			el(
				c.PanelBody,
				{
					title: __( 'Calculadora', 'hacecuentas-calculadoras' ),
					initialOpen: true,
				},
				el( Picker, {
					status: status,
					options: options,
					slug: slug,
					label: __( 'Elegí una calculadora', 'hacecuentas-calculadoras' ),
					onChange: setSlug,
				} ),
				el( c.RangeControl, {
					label: __( 'Alto inicial (px)', 'hacecuentas-calculadoras' ),
					value: height,
					onChange: function ( v ) {
						setAttributes( { height: v || 640 } );
					},
					min: 320,
					max: 1200,
					step: 20,
				} )
			)
		);

		var body;
		if ( ! slug ) {
			body = el(
				c.Placeholder,
				{
					icon: 'calculator',
					label: __( 'Calculadora Hacé Cuentas', 'hacecuentas-calculadoras' ),
					instructions: __(
						'Elegí una calculadora para insertarla en tu página.',
						'hacecuentas-calculadoras'
					),
				},
				el( Picker, {
					status: status,
					options: options,
					slug: slug,
					label: '',
					onChange: setSlug,
				} )
			);
		} else {
			body = el(
				'div',
				{
					style: {
						border: '1px solid #e2e8f0',
						borderRadius: '12px',
						overflow: 'hidden',
					},
				},
				el( 'iframe', {
					src: ORIGIN + '/embed/' + slug,
					title: slug,
					loading: 'lazy',
					style: {
						width: '100%',
						height: height + 'px',
						border: '0',
						display: 'block',
						background: '#fff',
					},
				} ),
				el(
					'p',
					{
						style: {
							fontSize: '12px',
							textAlign: 'center',
							color: '#475569',
							margin: '6px 0',
						},
					},
					'hacecuentas.com/' + slug
				)
			);
		}

		return el( Fragment, {}, inspector, el( 'div', blockProps, body ) );
	}

	wp.blocks.registerBlockType( 'hacecuentas/calculadora', {
		edit: Edit,
		save: function () {
			return null; // bloque dinámico: el HTML lo genera PHP (render_callback)
		},
	} );
} )();
