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

	// Populares curadas y verificadas embebibles. Un clic las inserta sin
	// buscar ni conocer el slug. Cubren contadores / finanzas / RRHH / salud / mate.
	var POPULAR = [
		{ slug: 'sueldo-en-mano-argentina', label: 'Sueldo en mano' },
		{ slug: 'calculadora-monotributo-2026', label: 'Monotributo 2026' },
		{ slug: 'calculadora-aguinaldo-sac', label: 'Aguinaldo (SAC)' },
		{ slug: 'calculadora-indemnizacion-despido', label: 'Indemnización' },
		{ slug: 'calculadora-impuesto-ganancias-sueldo', label: 'Ganancias' },
		{ slug: 'calculadora-cuota-prestamo', label: 'Cuota de préstamo' },
		{ slug: 'calculadora-interes-compuesto', label: 'Interés compuesto' },
		{ slug: 'calculadora-plazo-fijo', label: 'Plazo fijo' },
		{ slug: 'calculadora-imc', label: 'IMC' },
		{ slug: 'calculadora-porcentajes', label: 'Porcentajes' },
	];

	// Chips de populares: insertar al toque.
	function Popular( props ) {
		return el(
			'div',
			{
				style: {
					display: 'flex',
					flexWrap: 'wrap',
					gap: '6px',
					justifyContent: 'center',
					marginBottom: '14px',
				},
			},
			POPULAR.map( function ( p ) {
				return el(
					c.Button,
					{
						key: p.slug,
						variant: 'secondary',
						onClick: function () {
							props.onPick( p.slug );
						},
						style: { borderRadius: '999px' },
					},
					p.label
				);
			} )
		);
	}

	// Buscador del catálogo completo (combobox si cargó; input manual si falló).
	function Picker( props ) {
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
			fetch( ORIGIN + '/api/embed-calcs.json' )
				.then( function ( r ) {
					return r.ok ? r.json() : Promise.reject( r.status );
				} )
				.then( function ( data ) {
					if ( ! alive ) {
						return;
					}
					var opts = ( Array.isArray( data ) ? data : [] )
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

		// Título legible de la calc elegida (para el encabezado del preview).
		var currentLabel = slug;
		for ( var i = 0; i < options.length; i++ ) {
			if ( options[ i ].value === slug ) {
				currentLabel = options[ i ].label;
				break;
			}
		}

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
					label: __( 'Cambiar calculadora', 'hacecuentas-calculadoras' ),
					onChange: setSlug,
				} ),
				el( c.RangeControl, {
					label: __( 'Alto inicial (px)', 'hacecuentas-calculadoras' ),
					help: __(
						'Se ajusta solo al cargar; esto es sólo el alto de arranque.',
						'hacecuentas-calculadoras'
					),
					value: height,
					onChange: function ( v ) {
						setAttributes( { height: v || 640 } );
					},
					min: 320,
					max: 1200,
					step: 20,
				} ),
				el( c.ToggleControl, {
					label: __( 'Enlazar a la fuente (Hacé Cuentas)', 'hacecuentas-calculadoras' ),
					help: __(
						'Agrega un enlace de crédito debajo de la calculadora. Opcional, apagado por defecto.',
						'hacecuentas-calculadoras'
					),
					checked: !! attributes.credit,
					onChange: function ( v ) {
						setAttributes( { credit: !! v } );
					},
				} )
			)
		);

		var body;
		if ( ! slug ) {
			// Sin elegir: populares (1 clic) + buscador + "ver todas".
			body = el(
				c.Placeholder,
				{
					icon: 'calculator',
					label: __( 'Calculadora Hacé Cuentas', 'hacecuentas-calculadoras' ),
					instructions: __(
						'Elegí una de las más usadas o buscá entre todas las disponibles.',
						'hacecuentas-calculadoras'
					),
				},
				el(
					'div',
					{ style: { width: '100%' } },
					el( Popular, { onPick: setSlug } ),
					el( Picker, {
						status: status,
						options: options,
						slug: slug,
						label: __( '¿Otra? Buscá todas', 'hacecuentas-calculadoras' ),
						onChange: setSlug,
					} ),
					el(
						'a',
						{
							href: ORIGIN + '/buscar',
							target: '_blank',
							rel: 'noopener',
							style: {
								fontSize: '12px',
								marginTop: '10px',
								display: 'inline-block',
							},
						},
						__( 'Ver todas las calculadoras ↗', 'hacecuentas-calculadoras' )
					)
				)
			);
		} else {
			// Elegida: encabezado con título + "Cambiar" + preview en vivo.
			body = el(
				'div',
				{
					style: {
						border: '1px solid #e2e8f0',
						borderRadius: '12px',
						overflow: 'hidden',
					},
				},
				el(
					'div',
					{
						style: {
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'space-between',
							gap: '8px',
							padding: '6px 10px',
							background: '#f8fafc',
							borderBottom: '1px solid #e2e8f0',
						},
					},
					el(
						'strong',
						{ style: { fontSize: '13px', color: '#0f172a' } },
						currentLabel
					),
					el(
						c.Button,
						{
							variant: 'tertiary',
							onClick: function () {
								setSlug( '' );
							},
						},
						__( 'Cambiar', 'hacecuentas-calculadoras' )
					)
				),
				el( 'iframe', {
					src: ORIGIN + '/embed/' + slug,
					title: currentLabel,
					loading: 'lazy',
					style: {
						width: '100%',
						height: height + 'px',
						border: '0',
						display: 'block',
						background: '#fff',
					},
				} )
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
