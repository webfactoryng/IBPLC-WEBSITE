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

/* themes/custom/ibplc/templates/page--front.html.twig */
class __TwigTemplate_11884b79339c4d26ddf50d719b610602f27a7249397a383dfec2c6deab1fb719 extends \Twig\Template
{
    public function __construct(Environment $env)
    {
        parent::__construct($env);

        $this->parent = false;

        $this->blocks = [
        ];
        $this->sandbox = $this->env->getExtension('\Twig\Extension\SandboxExtension');
        $tags = ["include" => 2];
        $filters = ["escape" => 12];
        $functions = [];

        try {
            $this->sandbox->checkSecurity(
                ['include'],
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
        echo "<div class=\"page-container home \">
\t    ";
        // line 2
        $this->loadTemplate("@ibplc/imenux.html.twig", "themes/custom/ibplc/templates/page--front.html.twig", 2)->display($context);
        // line 3
        echo "<div>


 
    
    <div class=\"ab-home-hero parbase\">    
    <div class=\"home-hero\">
        <div class=\"home-hero-inner\">
          <div class=\"home-hero--featured\">
        ";
        // line 12
        echo $this->env->getExtension('Drupal\Core\Template\TwigExtension')->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed($this->getAttribute(($context["page"] ?? null), "main_banner", [])), "html", null, true);
        echo "    
        </div>
          <div class=\"home-hero--sidebar\">
          <div class=\"home-hero--featured-tweet\">
    <div class=\"twitter-card-home home-twitter-card \">
      <div class=\"twitter-card-home-inner\">
        <div class=\"twitter-card-home-body\">
          <a href=\"https://instagram.com/ibplc_ng\" class=\"twitter-card-home-source-container\">
            <img src=\"";
        // line 20
        echo $this->env->getExtension('Drupal\Core\Template\TwigExtension')->escapeFilter($this->env, ($this->sandbox->ensureToStringAllowed(($context["base_path"] ?? null)) . $this->sandbox->ensureToStringAllowed(($context["directory"] ?? null))), "html", null, true);
        echo "/images/ig.png\" width=\"30\" style=\"width:25px; position:absolute; margin-top:6px;\" /><h3 class=\"twitter-card-home-source\" style=\"padding-left:35px;\">@ibplc_ng</h3>
          </a>
          <div class=\"twitter-card-home-tweets-container\">
            <ul class=\"twitter-card-home-tweets-list\" id=\"TwitterData\">

            </ul>
          </div>
        </div>
      </div>
    </div>
</div>
\t<div class=\"home-hero--popular-stories\">
\t\t";
        // line 32
        echo $this->env->getExtension('Drupal\Core\Template\TwigExtension')->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed($this->getAttribute(($context["page"] ?? null), "media_updates", [])), "html", null, true);
        echo " 
\t</div>
\t\t  </div>
        </div>
      </div>
    <div class=\"content-section flush full-width\">
        <div class=\"content-section-inner\">
            <div class=\"callout-text \">
                <div class=\"callout-text-inner\">
                    <div class=\"callout-text-content\">
                        <p style=\"text-align:center; color:#fff;\"><br>
As a company of owners, we are happy to brew products and build brands that people love, brands that bring people together and will continue to do so for decades to come.
\t\t\t\t\t\t</p>
                    </div>
                </div>
            </div>
        </div>
    </div>

   
</div>


    
    
    <div class=\"ab-homepage-grid\"><div class=\"content-section empty-bg\" style=\"background-color:#fff;\">
    <div class=\"content-section-inner\">
        <div class=\"news-grid-home \">
            <div class=\"news-grid-home--header \">
                
            </div>  <div class=\"news-grid-home-inner\">
                <div class=\"news-grid-home--card-row featured ab-slider\" data-slider-options=\"\">
                    
<div class=\"ab-slider-track cf\" style=\"transition: transform 500ms ease 0s; will-change: transform; backface-visibility: hidden; width: 100%; transform: translateX(0px);\">
<div class=\"ibplc-content\" style=\"display:none;\">";
        // line 66
        echo $this->env->getExtension('Drupal\Core\Template\TwigExtension')->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed($this->getAttribute(($context["page"] ?? null), "ibplc_content", [])), "html", null, true);
        echo "</div>
<div class=\"ibplc-def-content\">";
        // line 67
        echo $this->env->getExtension('Drupal\Core\Template\TwigExtension')->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed($this->getAttribute(($context["page"] ?? null), "content", [])), "html", null, true);
        echo "</div>
</div>
<div class=\"ab-slider--controls\">
    <a href=\"javascript:void(0);\" class=\"ab-slider--control control-prev disabled\"><span class=\"ada-text\">Previous</span></a>
    <div class=\"ab-slider--nav-container\">
      <div class=\"ab-slider--nav-container---dot-container\"><a href=\"javascript:void(0);\" class=\"ab-slider--nav-container---nav-button active\"></a><a href=\"javascript:void(0);\" class=\"ab-slider--nav-container---nav-button\"></a><a href=\"javascript:void(0);\" class=\"ab-slider--nav-container---nav-button\"></a></div>
      <div class=\"ab-slider--nav-container---number-container\">1 of 3</div>
    </div>
    <a href=\"javascript:void(0);\" class=\"ab-slider--control control-next\"><span class=\"ada-text\">Next</span></a>
  </div></div>
  
  
  
  

            </div>

        </div>
    </div>
</div>

</div>


</div>

\t\t
";
        // line 94
        $this->loadTemplate("@ibplc/ifooter.html.twig", "themes/custom/ibplc/templates/page--front.html.twig", 94)->display($context);
        // line 95
        echo "\t</div>




<script type=\"text/javascript\" src=\"assets/clientlib-base.js\"></script>
<script type=\"text/javascript\" src=\"assets/bootstrap.customized.js\"></script>";
    }

    public function getTemplateName()
    {
        return "themes/custom/ibplc/templates/page--front.html.twig";
    }

    public function isTraitable()
    {
        return false;
    }

    public function getDebugInfo()
    {
        return array (  170 => 95,  168 => 94,  138 => 67,  134 => 66,  97 => 32,  82 => 20,  71 => 12,  60 => 3,  58 => 2,  55 => 1,);
    }

    /** @deprecated since 1.27 (to be removed in 2.0). Use getSourceContext() instead */
    public function getSource()
    {
        @trigger_error('The '.__METHOD__.' method is deprecated since version 1.27 and will be removed in 2.0. Use getSourceContext() instead.', E_USER_DEPRECATED);

        return $this->getSourceContext()->getCode();
    }

    public function getSourceContext()
    {
        return new Source("", "themes/custom/ibplc/templates/page--front.html.twig", "/home2/interbrew/public_html/v1/themes/custom/ibplc/templates/page--front.html.twig");
    }
}
