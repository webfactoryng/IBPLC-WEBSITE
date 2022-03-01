<?php

use Twig\Environment;
use Twig\Error\LoaderError;
use Twig\Error\RuntimeError;
use Twig\Markup;
use Twig\Sandbox\SecurityError;
use Twig\Sandbox\SecurityNotAllowedTagError;
use Twig\Sandbox\SecurityNotAllowedFilterError;
use Twig\Sandbox\SecurityNotAllowedFunctionError;
use Twig\Source;
use Twig\Template;

/* @ibplc/imenux.html.twig */
class __TwigTemplate_feb7b38a2f1f824f71797bc49986548b77d9a1447205143354e435885dc9e843 extends \Twig\Template
{
    public function __construct(Environment $env)
    {
        parent::__construct($env);

        $this->parent = false;

        $this->blocks = [
        ];
        $this->sandbox = $this->env->getExtension('\Twig\Extension\SandboxExtension');
        $tags = [];
        $filters = ["escape" => 6];
        $functions = [];

        try {
            $this->sandbox->checkSecurity(
                [],
                ['escape'],
                []
            );
        } catch (SecurityError $e) {
            $e->setSourceContext($this->getSourceContext());

            if ($e instanceof SecurityNotAllowedTagError && isset($tags[$e->getTagName()])) {
                $e->setTemplateLine($tags[$e->getTagName()]);
            } elseif ($e instanceof SecurityNotAllowedFilterError && isset($filters[$e->getFilterName()])) {
                $e->setTemplateLine($filters[$e->getFilterName()]);
            } elseif ($e instanceof SecurityNotAllowedFunctionError && isset($functions[$e->getFunctionName()])) {
                $e->setTemplateLine($functions[$e->getFunctionName()]);
            }

            throw $e;
        }

    }

    protected function doDisplay(array $context, array $blocks = [])
    {
        // line 1
        echo "\t\t<nav id=\"head-nav\" class=\"head-nav fixed\" style=\"\">
      <div class=\"head-nav-container\">
      <div class=\"head-nav-section home-link-container\">
          <ul class=\"home-link-list\">
            <li class=\"home-link-item\">    
              <a href=\"";
        // line 6
        echo $this->env->getExtension('Drupal\Core\Template\TwigExtension')->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed(($context["base_path"] ?? null)), "html", null, true);
        echo "\" class=\"home-link nav-logo nav-link\">
                <span class=\"ada-text\">IBPLC Logo</span>
                <img class=\"nav-logo--img\" src=\"";
        // line 8
        echo $this->env->getExtension('Drupal\Core\Template\TwigExtension')->escapeFilter($this->env, ($this->sandbox->ensureToStringAllowed(($context["base_path"] ?? null)) . $this->sandbox->ensureToStringAllowed(($context["directory"] ?? null))), "html", null, true);
        echo "/assets/nlogo.png\" alt=\"ABInBev Logo\">
              </a>
            </li>
          </ul>
        </div>   
\t\t<div class=\"head-nav-section main-link-container\" style=\"right: auto;\">
          <div class=\"main-link-item mobile-menu\">    
            <a href=\"javascript:void(0);\" class=\"main-link mobile-menu-button-close ab-mobile nav-link\">
              <span class=\"ada-text\">Close Mobile Nav</span>
            </a>
          </div>

\t\t\t<div>

<div class=\"link-container link-container--level-0\">  
\t<ul class=\"link-list\">
\t  <li class=\"link-item link-item--level-0 link-item--header\">
\t\t<span class=\"nav-link nav-link--level-0\">Menu</span>
\t  </li>
<li class=\"link-item link-item--level-0\"><a class=\"nav-link nav-link--level-0\" href=\"#\">Who We Are</a>
        \t<div class=\"link-container link-container--level-1\">
\t\t\t<div class=\"shadow-container\"></div>
        \t<ul class=\"link-list link-list--level-1\">
            <li class=\"link-item link-item--level-0 link-item--header\">
\t\t\t<a href=\"javascript:void(0);\" class=\"nav-link nav-back\"></a><a class=\"nav-link nav-link--level-0\" href=\"";
        // line 32
        echo $this->env->getExtension('Drupal\Core\Template\TwigExtension')->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed(($context["base_path"] ?? null)), "html", null, true);
        echo "who-we-are\">Who We Are</a></li>
\t\t\t<li class=\"link-item link-item--level-1\"><a class=\"nav-link nav-link--level-1  \" href=\"";
        // line 33
        echo $this->env->getExtension('Drupal\Core\Template\TwigExtension')->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed(($context["base_path"] ?? null)), "html", null, true);
        echo "leadership\">Leadership Team</a></li>
        \t<li class=\"link-item link-item--level-1\"><a class=\"nav-link nav-link--level-1  \" href=\"";
        // line 34
        echo $this->env->getExtension('Drupal\Core\Template\TwigExtension')->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed(($context["base_path"] ?? null)), "html", null, true);
        echo "values\">Our Values</a></li>
        \t<li class=\"link-item link-item--level-1\"><a class=\"nav-link nav-link--level-1  \" href=\"";
        // line 35
        echo $this->env->getExtension('Drupal\Core\Template\TwigExtension')->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed(($context["base_path"] ?? null)), "html", null, true);
        echo "mission\">Our Dream</a></li>
        \t<li class=\"link-item link-item--level-1\"><a class=\"nav-link nav-link--level-1 has-submenu\" href=\"";
        // line 36
        echo $this->env->getExtension('Drupal\Core\Template\TwigExtension')->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed(($context["base_path"] ?? null)), "html", null, true);
        echo "history\">Our Heritage</a></li>
            </ul>
        \t</div>

</li>
<li class=\"link-item link-item--level-0\"><a class=\"nav-link nav-link--level-0\" href=\"";
        // line 41
        echo $this->env->getExtension('Drupal\Core\Template\TwigExtension')->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed(($context["base_path"] ?? null)), "html", null, true);
        echo "what-we-do\">What We Do</a>
        \t<div class=\"link-container link-container--level-1\">
\t\t\t<div class=\"shadow-container\"></div>
        \t<ul class=\"link-list link-list--level-1\">
            <li class=\"link-item link-item--level-0 link-item--header\">
\t\t\t<a href=\"javascript:void(0);\" class=\"nav-link nav-back\"></a><a class=\"nav-link nav-link--level-0\" href=\"";
        // line 46
        echo $this->env->getExtension('Drupal\Core\Template\TwigExtension')->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed(($context["base_path"] ?? null)), "html", null, true);
        echo "what-we-do\">What We Do</a></li>
            <li class=\"link-item link-item--level-1\"><a class=\"nav-link nav-link--level-1  \" href=\"";
        // line 47
        echo $this->env->getExtension('Drupal\Core\Template\TwigExtension')->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed(($context["base_path"] ?? null)), "html", null, true);
        echo "responsible-drinking\">Responsible Drinking</a></li>
        \t<li class=\"link-item link-item--level-1\"><a class=\"nav-link nav-link--level-1\" href=\"https://www.internationalbreweriesfoundation.org/\" target=\"_blank\">International Breweries Foundation</a></li>
            </ul>
        \t</div>

</li>
<li class=\"link-item link-item--level-0\"><a class=\"nav-link nav-link--level-0\" href=\"";
        // line 53
        echo $this->env->getExtension('Drupal\Core\Template\TwigExtension')->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed(($context["base_path"] ?? null)), "html", null, true);
        echo "brands\">Our Brands</a></li>
<li class=\"link-item link-item--level-0\"><a class=\"nav-link nav-link--level-0\" href=\"";
        // line 54
        echo $this->env->getExtension('Drupal\Core\Template\TwigExtension')->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed(($context["base_path"] ?? null)), "html", null, true);
        echo "policies\">Our Policies</a></li>
<li class=\"link-item link-item--level-0\"><a class=\"nav-link nav-link--level-0\" href=\"";
        // line 55
        echo $this->env->getExtension('Drupal\Core\Template\TwigExtension')->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed(($context["base_path"] ?? null)), "html", null, true);
        echo "sustainability\">Sustainability</a>
        \t<div class=\"link-container link-container--level-1\">
\t\t\t<div class=\"shadow-container\"></div>
        \t<ul class=\"link-list link-list--level-1\">
            <li class=\"link-item link-item--level-0 link-item--header\">
\t\t\t<a href=\"javascript:void(0);\" class=\"nav-link nav-back\"></a><a class=\"nav-link nav-link--level-0\" href=\"";
        // line 60
        echo $this->env->getExtension('Drupal\Core\Template\TwigExtension')->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed(($context["base_path"] ?? null)), "html", null, true);
        echo "sustainability\">Sustainability</a></li>
            <li class=\"link-item link-item--level-0\"><a class=\"nav-link nav-link--level-1  \" href=\"";
        // line 61
        echo $this->env->getExtension('Drupal\Core\Template\TwigExtension')->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed(($context["base_path"] ?? null)), "html", null, true);
        echo "2025-goals\">2025 Sustainability Goals </a>

            
            </li>
        \t<li class=\"link-item link-item--level-1\"><a class=\"nav-link nav-link--level-1  \" href=\"";
        // line 65
        echo $this->env->getExtension('Drupal\Core\Template\TwigExtension')->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed(($context["base_path"] ?? null)), "html", null, true);
        echo "csi\">Corporate Social Investment &#8594;</a>
        \t
<div class=\"link-container link-container--level-2\">
\t\t\t  <div class=\"shadow-container\"></div>
             
        \t<ul class=\"link-list link-list--level-2\">
                <li class=\"link-item link-item--level-1 link-item--header\">
\t\t\t\t  <a href=\"javascript:void(0);\" class=\"nav-link nav-back\"></a>
\t\t\t\t  <a class=\"nav-link nav-link--level-1\" href=\"2025-goals\">Corporate Social Investment</a>
\t\t\t\t</li>
<li class=\"link-item link-item--level-2\"><a class=\"nav-link nav-link--level-2  \" href=\"";
        // line 75
        echo $this->env->getExtension('Drupal\Core\Template\TwigExtension')->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed(($context["base_path"] ?? null)), "html", null, true);
        echo "empowerment\">Empowerment</a></li>
<li class=\"link-item link-item--level-2\"><a class=\"nav-link nav-link--level-2  \" href=\"";
        // line 76
        echo $this->env->getExtension('Drupal\Core\Template\TwigExtension')->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed(($context["base_path"] ?? null)), "html", null, true);
        echo "education\">Education</a></li>
<li class=\"link-item link-item--level-2\"><a class=\"nav-link nav-link--level-2  \" href=\"";
        // line 77
        echo $this->env->getExtension('Drupal\Core\Template\TwigExtension')->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed(($context["base_path"] ?? null)), "html", null, true);
        echo "health\">Health</a></li>
<li class=\"link-item link-item--level-2\"><a class=\"nav-link nav-link--level-2  \" href=\"";
        // line 78
        echo $this->env->getExtension('Drupal\Core\Template\TwigExtension')->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed(($context["base_path"] ?? null)), "html", null, true);
        echo "infrastructure-support\">Infrastructural Support</a></li>
<li class=\"link-item link-item--level-2\"><a class=\"nav-link nav-link--level-2  \" href=\"";
        // line 79
        echo $this->env->getExtension('Drupal\Core\Template\TwigExtension')->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed(($context["base_path"] ?? null)), "html", null, true);
        echo "responsible-drinking\">Responsible Drinking</a></li>
</ul>
</div>        \t
        \t</li>
        \t<li class=\"link-item link-item--level-1\"><a class=\"nav-link nav-link--level-1 has-submenu\" href=\"#\">National CSR Projects &#8594;</a>
<div class=\"link-container link-container--level-2\">
\t\t\t  <div class=\"shadow-container\"></div>
             
        \t<ul class=\"link-list link-list--level-2\">
                <li class=\"link-item link-item--level-1 link-item--header\">
\t\t\t\t  <a href=\"javascript:void(0);\" class=\"nav-link nav-back\"></a>
\t\t\t\t  <a class=\"nav-link nav-link--level-1\" href=\"#\">National CSR Projects &#8594;</a>
\t\t\t\t</li>
<li class=\"link-item link-item--level-2\"><a class=\"nav-link nav-link--level-2  \" href=\"";
        // line 92
        echo $this->env->getExtension('Drupal\Core\Template\TwigExtension')->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed(($context["base_path"] ?? null)), "html", null, true);
        echo "kickstart\">KickStart</a></li>
<li class=\"link-item link-item--level-2\"><a class=\"nav-link nav-link--level-2  \" href=\"";
        // line 93
        echo $this->env->getExtension('Drupal\Core\Template\TwigExtension')->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed(($context["base_path"] ?? null)), "html", null, true);
        echo "trophy-academy\">Trophy Academy</a></li>
<li class=\"link-item link-item--level-2\"><a class=\"nav-link nav-link--level-2  \" href=\"";
        // line 94
        echo $this->env->getExtension('Drupal\Core\Template\TwigExtension')->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed(($context["base_path"] ?? null)), "html", null, true);
        echo "digital-villages\">Digital Villages</a></li>
<li class=\"link-item link-item--level-2\"><a class=\"nav-link nav-link--level-2  \" href=\"";
        // line 95
        echo $this->env->getExtension('Drupal\Core\Template\TwigExtension')->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed(($context["base_path"] ?? null)), "html", null, true);
        echo "volunteering\">Volunteering (Better World Champions)</a></li>
</ul>
</div>          \t</li>
        \t<li class=\"link-item link-item--level-1\"><a class=\"nav-link nav-link--level-1 has-submenu\" href=\"";
        // line 98
        echo $this->env->getExtension('Drupal\Core\Template\TwigExtension')->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed(($context["base_path"] ?? null)), "html", null, true);
        echo "cdp\">Community Development Projects</a></li>
            </ul>
        \t</div>
</li>
<li class=\"link-item link-item--level-0\"><a class=\"nav-link nav-link--level-0\" href=\"";
        // line 102
        echo $this->env->getExtension('Drupal\Core\Template\TwigExtension')->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed(($context["base_path"] ?? null)), "html", null, true);
        echo "media\">News &amp; Media</a></li>
<li class=\"link-item link-item--level-0\"><a class=\"nav-link nav-link--level-0\" href=\"#\">Investor Relations</a>
<div class=\"link-container link-container--level-1\">
\t\t\t<div class=\"shadow-container\"></div>
        \t<ul class=\"link-list link-list--level-1\">
            <li class=\"link-item link-item--level-0 link-item--header\">
\t\t\t<a href=\"javascript:void(0);\" class=\"nav-link nav-back\"></a><a class=\"nav-link nav-link--level-0\" href=\"#\">Investor Relations</a></li>
            <li class=\"link-item link-item--level-1\"><a class=\"nav-link nav-link--level-1  \" href=\"";
        // line 109
        echo $this->env->getExtension('Drupal\Core\Template\TwigExtension')->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed(($context["base_path"] ?? null)), "html", null, true);
        echo "board\">Our Board</a></li>
            <li class=\"link-item link-item--level-1\"><a class=\"nav-link nav-link--level-1  \" href=\"";
        // line 110
        echo $this->env->getExtension('Drupal\Core\Template\TwigExtension')->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed(($context["base_path"] ?? null)), "html", null, true);
        echo "reports\">Annual Reports</a></li>
            <li class=\"link-item link-item--level-1\"><a class=\"nav-link nav-link--level-1  \" href=\"";
        // line 111
        echo $this->env->getExtension('Drupal\Core\Template\TwigExtension')->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed(($context["base_path"] ?? null)), "html", null, true);
        echo "po\">Purchase Order T&C</a></li>
            </ul>
        \t</div>
</li>
<li class=\"link-item link-item--level-0\"><a class=\"nav-link nav-link--level-0\" href=\"";
        // line 115
        echo $this->env->getExtension('Drupal\Core\Template\TwigExtension')->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed(($context["base_path"] ?? null)), "html", null, true);
        echo "careers\">Careers</a>
<div class=\"link-container link-container--level-1\">
\t\t\t<div class=\"shadow-container\"></div>
        \t<ul class=\"link-list link-list--level-1\">
            <li class=\"link-item link-item--level-0 link-item--header\">
\t\t\t<a href=\"javascript:void(0);\" class=\"nav-link nav-back\"></a><a class=\"nav-link nav-link--level-0\" href=\"";
        // line 120
        echo $this->env->getExtension('Drupal\Core\Template\TwigExtension')->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed(($context["base_path"] ?? null)), "html", null, true);
        echo "careers\">Careers</a></li>
            <li class=\"link-item link-item--level-1\"><a class=\"nav-link nav-link--level-1  \" href=\"";
        // line 121
        echo $this->env->getExtension('Drupal\Core\Template\TwigExtension')->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed(($context["base_path"] ?? null)), "html", null, true);
        echo "gmtp\">Global Management Trainee Program</a></li>
            </ul>
        \t</div>

</li>
<li class=\"link-item link-item--level-0\"><a class=\"nav-link nav-link--level-0\" href=\"";
        // line 126
        echo $this->env->getExtension('Drupal\Core\Template\TwigExtension')->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed(($context["base_path"] ?? null)), "html", null, true);
        echo "contactus\">Contact</a></li>
</ul>
</div>

</div>

         </div>    
\t\t<div class=\"head-nav-section\">
          <ul class=\"utility-links-list\">
            <li class=\"utility-link-item nav-link-container\">
              <a class=\"utility-link utility-link--language nav-link\" href=\"";
        // line 136
        echo $this->env->getExtension('Drupal\Core\Template\TwigExtension')->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed(($context["base_path"] ?? null)), "html", null, true);
        echo "contact\"><span class=\"ada-text\">Our Locations</span></a>
            </li>
            <li class=\"utility-link-item nav-link-container\">
              <a class=\"utility-link utility-link--search nav-link\" href=\"#\"><span class=\"ada-text\">Search</span></a>
                <div id=\"utility-link--search-expanded\" class=\"utility-link--search-expanded enabled\">
                    <div class=\"utility-link--search-expanded-inner\">
                        <div class=\"utility-link--search-form\">
                            <form action=\"global.html\" class=\"utility-link--search-form\">
                                <input type=\"text\" class=\"utility-link--search-input\" name=\"keyword\" id=\"globelSearchKey\" placeholder=\"Keywords, titles, categories...\">
                                <input type=\"submit\" class=\"utility-link--search-submit button primary\" value=\"Search\">
                            </form>
                        </div>
                        <ul class=\"utility-link--search-links\">
                            <li class=\"utility-link--search-link-wrapper\">
                                <a href=\"investors/document-search.html\" class=\"utility-link--search-link\">Document Search</a>
                            </li>
                            
                                
                            
                        </ul>
                    </div>
                </div>
            </li>
            <li class=\"utility-link-item\">
              <a href=\"javascript:void(0);\" class=\"utility-link--mobile-menu ab-mobile mobile-menu-button nav-link\">
                <span class=\"ada-text\">Mobile Menu</span>
                <span class=\"line-1\"></span>
                <span class=\"line-2\"></span>
                <span class=\"line-3\"></span>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
";
    }

    public function getTemplateName()
    {
        return "@ibplc/imenux.html.twig";
    }

    public function isTraitable()
    {
        return false;
    }

    public function getDebugInfo()
    {
        return array (  294 => 136,  281 => 126,  273 => 121,  269 => 120,  261 => 115,  254 => 111,  250 => 110,  246 => 109,  236 => 102,  229 => 98,  223 => 95,  219 => 94,  215 => 93,  211 => 92,  195 => 79,  191 => 78,  187 => 77,  183 => 76,  179 => 75,  166 => 65,  159 => 61,  155 => 60,  147 => 55,  143 => 54,  139 => 53,  130 => 47,  126 => 46,  118 => 41,  110 => 36,  106 => 35,  102 => 34,  98 => 33,  94 => 32,  67 => 8,  62 => 6,  55 => 1,);
    }

    /** @deprecated since 1.27 (to be removed in 2.0). Use getSourceContext() instead */
    public function getSource()
    {
        @trigger_error('The '.__METHOD__.' method is deprecated since version 1.27 and will be removed in 2.0. Use getSourceContext() instead.', E_USER_DEPRECATED);

        return $this->getSourceContext()->getCode();
    }

    public function getSourceContext()
    {
        return new Source("", "@ibplc/imenux.html.twig", "/home/nigerium/public_html/ibplcx/themes/custom/ibplc/templates/imenux.html.twig");
    }
}
